import type { Money } from "@ridenow/shared-types";

export interface Authorization {
  authorizationId: string;
  amount: Money;
}

/**
 * Port for card payments. The skeleton binds a fake in-memory adapter; the real
 * Stripe (test mode) adapter is deferred to the payments feature story.
 */
export interface PaymentProvider {
  readonly name: string;
  authorize(amount: Money, reference: string): Promise<Authorization>;
  capture(authorizationId: string): Promise<{ captured: true }>;
}

export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");
