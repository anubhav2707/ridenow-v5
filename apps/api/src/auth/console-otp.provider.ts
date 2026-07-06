import { Injectable, Logger } from "@nestjs/common";
import type { OtpChallenge, OtpProvider } from "./otp.port";

/** Deterministic OTP stub: logs the code (as the real dev mode does too). */
@Injectable()
export class ConsoleOtpProvider implements OtpProvider {
  private readonly logger = new Logger(ConsoleOtpProvider.name);

  send(phone: string): Promise<OtpChallenge> {
    const code = "000000";
    this.logger.log(`(dev) OTP for ${phone} is ${code}`);
    return Promise.resolve({ phone, code });
  }
}
