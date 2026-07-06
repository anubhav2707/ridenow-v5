import type { Money } from "@ridenow/shared-types";

export interface PaymentResult {
  id: string;
  status: "succeeded";
  amount: Money;
}

/**
 * Port for charging a card. The scaffold ships a fake that always succeeds; a
 * later story swaps in a Stripe (test-mode) adapter behind this same interface.
 */
export interface PaymentProvider {
  charge(amount: Money, reference: string): Promise<PaymentResult>;
}

export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");
