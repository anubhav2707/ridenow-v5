import { Module } from "@nestjs/common";
import { AppConfig } from "../config/app-config";
import { OTP_PROVIDER } from "./otp.port";
import { ConsoleOtpProvider } from "./console-otp.provider";
import { AuthService } from "./auth.service";

@Module({
  providers: [
    ConsoleOtpProvider,
    {
      provide: OTP_PROVIDER,
      inject: [AppConfig, ConsoleOtpProvider],
      useFactory: (cfg: AppConfig, mock: ConsoleOtpProvider) => {
        if (cfg.otpProvider === "mock") return mock;
        throw new Error(
          `OTP_PROVIDER='${cfg.otpProvider}' is not implemented yet (real Twilio is deferred to the auth story)`,
        );
      },
    },
    AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
