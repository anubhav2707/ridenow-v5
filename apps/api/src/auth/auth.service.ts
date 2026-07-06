import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { randomInt, randomUUID } from "node:crypto";
import { OTP_PROVIDER, type OtpProvider } from "./ports/otp-provider";
import { loadApiConfig } from "../config/env";

interface PendingOtp {
  code: string;
  expiresAt: number;
}

export interface RequestOtpResult {
  sent: true;
  channel: string;
  /** Present only in mock mode so the demo/watch-loop can auto-verify. */
  devCode?: string;
}

export interface VerifyOtpResult {
  token: string;
  phone: string;
}

const OTP_TTL_MS = 5 * 60 * 1000;

/**
 * Phone-OTP auth for the skeleton. State is in-memory (a Map + Set) — good
 * enough for the faked loop; the persistence + real Twilio delivery land in the
 * auth feature story. The guarantee enforced here: a session token is issued
 * ONLY after the correct, unexpired code for that phone is submitted.
 */
@Injectable()
export class AuthService {
  private readonly pending = new Map<string, PendingOtp>();
  private readonly sessions = new Set<string>();

  constructor(@Inject(OTP_PROVIDER) private readonly otp: OtpProvider) {}

  async requestOtp(phone: string): Promise<RequestOtpResult> {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    this.pending.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
    await this.otp.sendOtp(phone, code);

    const result: RequestOtpResult = { sent: true, channel: this.otp.name };
    if (loadApiConfig().otpProvider === "mock") {
      result.devCode = code;
    }
    return result;
  }

  async verifyOtp(phone: string, code: string): Promise<VerifyOtpResult> {
    const entry = this.pending.get(phone);
    if (!entry || entry.expiresAt < Date.now() || entry.code !== code) {
      throw new UnauthorizedException("invalid or expired code");
    }
    this.pending.delete(phone);

    const token = `sess_${randomUUID()}`;
    this.sessions.add(token);
    return { token, phone };
  }

  isAuthenticated(token: string): boolean {
    return this.sessions.has(token);
  }
}
