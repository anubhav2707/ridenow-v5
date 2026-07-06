import { Module } from "@nestjs/common";
import { PAYMENT_PROVIDER, type PaymentProvider } from "./payment.port";
import { FakePaymentProvider } from "./fake-payment.provider";

/** Selects the payment adapter from PAYMENT_PROVIDER (mock by default). */
function selectPaymentProvider(): PaymentProvider {
  const mode = process.env.PAYMENT_PROVIDER ?? "mock";
  if (mode === "mock") return new FakePaymentProvider();
  throw new Error(
    `PAYMENT_PROVIDER="${mode}" is not implemented in the scaffold (deferred to the payments story)`,
  );
}

@Module({
  providers: [{ provide: PAYMENT_PROVIDER, useFactory: selectPaymentProvider }],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
