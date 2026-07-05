import type { Money } from "@ridenow/shared-types";

/** DI token for the payment provider port. */
export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");

export interface PaymentIntent {
  id: string;
  status: "authorized" | "captured";
  amount: Money;
}

/**
 * Port for card payments. The mock adapter returns canned intents; the real
 * Stripe (test-mode) adapter is deferred to the payments story.
 */
export interface PaymentProvider {
  authorize(amount: Money, reference: string): Promise<PaymentIntent>;
  capture(intentId: string, amount: Money): Promise<PaymentIntent>;
}
