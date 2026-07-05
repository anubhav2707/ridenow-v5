import { Module } from "@nestjs/common";
import { AppConfig } from "../config/app-config";
import { PAYMENT_PROVIDER } from "./payment.port";
import { FakePaymentProvider } from "./fake-payment.provider";

@Module({
  providers: [
    FakePaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      inject: [AppConfig, FakePaymentProvider],
      useFactory: (cfg: AppConfig, mock: FakePaymentProvider) => {
        if (cfg.paymentProvider === "mock") return mock;
        throw new Error(
          `PAYMENT_PROVIDER='${cfg.paymentProvider}' is not implemented yet (real Stripe test-mode is deferred to the payments story)`,
        );
      },
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
