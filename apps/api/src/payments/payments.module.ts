import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PAYMENT_PROVIDER } from "./ports/payment-provider";
import { FakePaymentProvider } from "./adapters/fake-payment.provider";

@Module({
  providers: [
    PaymentsService,
    { provide: PAYMENT_PROVIDER, useClass: FakePaymentProvider },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
