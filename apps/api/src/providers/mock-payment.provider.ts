import { Injectable } from "@nestjs/common";
import type { Money } from "@ridenow/shared-types";
import type { PaymentPort, PaymentResult } from "./ports";

/** Fake payment adapter: always succeeds, no Stripe call. Deterministic id. */
@Injectable()
export class MockPaymentProvider implements PaymentPort {
  async charge(amount: Money, reference: string): Promise<PaymentResult> {
    return {
      paymentId: `fake_pay_${reference}`,
      status: "succeeded",
      amount,
    };
  }
}
