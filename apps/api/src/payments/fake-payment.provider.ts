import { Injectable } from "@nestjs/common";
import type { Money } from "@ridenow/shared-types";
import type { PaymentProvider, PaymentResult } from "./payment.port";

/** Deterministic payment stub: records intent and always succeeds. */
@Injectable()
export class FakePaymentProvider implements PaymentProvider {
  charge(amount: Money, reference: string): Promise<PaymentResult> {
    return Promise.resolve({ id: `fake_pi_${reference}`, status: "succeeded", amount });
  }
}
