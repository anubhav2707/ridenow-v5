import { Global, Module } from "@nestjs/common";
import { GEO_PROVIDER, OTP_PROVIDER, PAYMENT_PROVIDER } from "./ports";
import { MockOtpProvider } from "./mock-otp.provider";
import { MockPaymentProvider } from "./mock-payment.provider";
import { MockGeoProvider } from "./mock-geo.provider";

/**
 * Binds every external-dependency port to its default MOCK adapter. Global so any
 * feature module can inject a port by token without re-importing. A later story
 * swaps a token's `useClass` to the real adapter — nothing else changes.
 */
@Global()
@Module({
  providers: [
    { provide: OTP_PROVIDER, useClass: MockOtpProvider },
    { provide: PAYMENT_PROVIDER, useClass: MockPaymentProvider },
    { provide: GEO_PROVIDER, useClass: MockGeoProvider },
  ],
  exports: [OTP_PROVIDER, PAYMENT_PROVIDER, GEO_PROVIDER],
})
export class ProvidersModule {}
