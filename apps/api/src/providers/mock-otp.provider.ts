import { Injectable, Logger } from "@nestjs/common";
import type { OtpPort } from "./ports";

/** Deterministic OTP adapter: always issues 000000 and logs it (no Twilio). */
@Injectable()
export class MockOtpProvider implements OtpPort {
  private readonly logger = new Logger("MockOtpProvider");
  private static readonly DEV_CODE = "000000";

  async sendOtp(phone: string): Promise<{ sentTo: string; devCode: string }> {
    this.logger.log(`[dev-otp] code for ${phone} is ${MockOtpProvider.DEV_CODE}`);
    return { sentTo: phone, devCode: MockOtpProvider.DEV_CODE };
  }

  async verifyOtp(_phone: string, code: string): Promise<boolean> {
    return code === MockOtpProvider.DEV_CODE;
  }
}
