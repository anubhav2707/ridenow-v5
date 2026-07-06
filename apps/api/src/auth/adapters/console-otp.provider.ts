import { Injectable, Logger } from "@nestjs/common";
import type { OtpProvider } from "../ports/otp-provider";

/**
 * Deterministic MOCK OTP adapter: "delivers" the code by logging it to the dev
 * console (the PRD requires OTPs be logged in dev). Keyless — no Twilio needed.
 */
@Injectable()
export class ConsoleOtpProvider implements OtpProvider {
  readonly name = "console";
  private readonly logger = new Logger("OtpProvider");

  async sendOtp(phone: string, code: string): Promise<void> {
    this.logger.log(`OTP for ${phone}: ${code} (dev console channel)`);
  }
}
