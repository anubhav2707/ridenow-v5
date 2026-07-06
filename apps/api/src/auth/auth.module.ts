import { Module } from "@nestjs/common";
import { OTP_PROVIDER, type OtpProvider } from "./otp.port";
import { ConsoleOtpProvider } from "./console-otp.provider";

/** Selects the OTP adapter from OTP_PROVIDER (mock by default). */
function selectOtpProvider(): OtpProvider {
  const mode = process.env.OTP_PROVIDER ?? "mock";
  if (mode === "mock") return new ConsoleOtpProvider();
  throw new Error(`OTP_PROVIDER="${mode}" is not implemented in the scaffold (deferred to the auth story)`);
}

@Module({
  providers: [{ provide: OTP_PROVIDER, useFactory: selectOtpProvider }],
  exports: [OTP_PROVIDER],
})
export class AuthModule {}
