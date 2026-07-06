import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { Money } from "@ridenow/shared-types";
import type {
  Authorization,
  PaymentProvider,
} from "../ports/payment-provider";

/**
 * Deterministic MOCK payment adapter: always authorizes/captures successfully
 * and never touches the network. The real Stripe test-mode adapter swaps in
 * later with no call-site change.
 */
@Injectable()
export class FakePaymentProvider implements PaymentProvider {
  readonly name = "fake";
  private readonly captured = new Set<string>();

  async authorize(amount: Money, reference: string): Promise<Authorization> {
    return { authorizationId: `auth_${reference}_${randomUUID()}`, amount };
  }

  async capture(authorizationId: string): Promise<{ captured: true }> {
    this.captured.add(authorizationId);
    return { captured: true };
  }
}
