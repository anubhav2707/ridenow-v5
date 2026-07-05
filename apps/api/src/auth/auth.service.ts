import { Inject, Injectable } from "@nestjs/common";
import { OTP_PROVIDER, type OtpProvider } from "./otp.port";

/** Fixed code in mock mode so the faked signup flow is deterministic. */
const MOCK_OTP_CODE = "000000";

/**
 * Phone-OTP signup, faked over the mock OTP adapter. In-memory only — real
 * persistence + Twilio delivery land in the auth story.
 */
@Injectable()
export class AuthService {
  private readonly pending = new Map<string, string>();

  constructor(@Inject(OTP_PROVIDER) private readonly otp: OtpProvider) {}

  async requestOtp(phone: string): Promise<{ sent: true }> {
    const code = MOCK_OTP_CODE;
    this.pending.set(phone, code);
    await this.otp.sendOtp(phone, code);
    return { sent: true };
  }

  verifyOtp(phone: string, code: string): { verified: boolean } {
    return { verified: this.pending.get(phone) === code };
  }
}
