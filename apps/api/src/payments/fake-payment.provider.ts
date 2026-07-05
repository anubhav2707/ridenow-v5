import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Money } from "@ridenow/shared-types";
import type { PaymentIntent, PaymentProvider } from "./payment.port";

/** Mock payment adapter — always succeeds, zero network, integer minor units. */
@Injectable()
export class FakePaymentProvider implements PaymentProvider {
  async authorize(amount: Money, _reference: string): Promise<PaymentIntent> {
    return { id: `pi_mock_${randomUUID()}`, status: "authorized", amount };
  }

  async capture(intentId: string, amount: Money): Promise<PaymentIntent> {
    return { id: intentId, status: "captured", amount };
  }
}
