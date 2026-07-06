import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OTP_PROVIDER } from "./ports/otp-provider";
import { ConsoleOtpProvider } from "./adapters/console-otp.provider";

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    // Mock adapter by default. The real Twilio adapter swaps in here.
    { provide: OTP_PROVIDER, useClass: ConsoleOtpProvider },
  ],
  exports: [AuthService],
})
export class AuthModule {}
