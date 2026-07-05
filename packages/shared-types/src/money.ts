import { z } from "zod";

/**
 * Money is ALWAYS integer minor units (e.g. cents/paise) plus an ISO-4217
 * currency. Floats are never used for money anywhere in RideNow — this is the
 * schema-level guarantee that keeps the fare/earnings ledgers exact.
 */
export const MoneySchema = z.object({
  /** Integer minor units. 1099 === $10.99 for a 2-decimal currency. */
  amount: z.number().int(),
  /** ISO-4217 code, upper-case (e.g. "USD"). */
  currency: z.string().length(3).toUpperCase(),
});

export type Money = z.infer<typeof MoneySchema>;

/** Construct Money, rejecting non-integer minor-unit amounts at runtime. */
export function money(amount: number, currency: string): Money {
  return MoneySchema.parse({ amount, currency });
}

export function zero(currency: string): Money {
  return money(0, currency);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount - b.amount, currency: a.currency };
}

/**
 * Multiply money by a rational basis-points factor and round to the nearest
 * minor unit. Used for commission (e.g. 2000 bps === 20%). Rounding happens on
 * integers so the result is deterministic and never drifts.
 */
export function applyBasisPoints(value: Money, basisPoints: number): Money {
  const scaled = Math.round((value.amount * basisPoints) / 10_000);
  return { amount: scaled, currency: value.currency };
}

/** Human-readable formatting for logs/UI. Never used for arithmetic. */
export function formatMoney(value: Money, fractionDigits = 2): string {
  const major = value.amount / 10 ** fractionDigits;
  return `${value.currency} ${major.toFixed(fractionDigits)}`;
}
