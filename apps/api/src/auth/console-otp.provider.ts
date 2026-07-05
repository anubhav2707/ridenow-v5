import { Injectable, Logger } from "@nestjs/common";
import type { OtpProvider } from "./otp.port";

/** Mock OTP adapter: "delivers" the code by logging it (dev-visible). */
@Injectable()
export class ConsoleOtpProvider implements OtpProvider {
  private readonly logger = new Logger("ConsoleOtpProvider");

  async sendOtp(phone: string, code: string): Promise<void> {
    this.logger.log(`OTP for ${phone} is ${code} (dev mock — no SMS sent)`);
  }
}
