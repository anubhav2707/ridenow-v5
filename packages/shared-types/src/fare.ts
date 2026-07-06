import { z } from "zod";
import { MoneySchema, money, addMoney } from "./money.js";

/**
 * A transparent, upfront fare quote. Every component is integer minor units so
 * the total the rider sees is exactly what Stripe is later asked to charge.
 */
export const FareQuoteSchema = z.object({
  currency: z.string().length(3),
  baseFare: MoneySchema,
  distanceComponent: MoneySchema,
  timeComponent: MoneySchema,
  total: MoneySchema,
  distanceMeters: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
});

export type FareQuote = z.infer<typeof FareQuoteSchema>;

/** Tariff in integer minor units. Defaults model a simple flat city tariff. */
export interface FareTariff {
  currency: string;
  baseFareMinor: number;
  perKmMinor: number;
  perMinuteMinor: number;
}

export const DEFAULT_TARIFF: FareTariff = {
  currency: "USD",
  baseFareMinor: 250, // $2.50 flag-fall
  perKmMinor: 120, // $1.20 / km
  perMinuteMinor: 30, // $0.30 / min
};

export interface RouteEstimate {
  distanceMeters: number;
  durationSeconds: number;
}

/**
 * Compute a fare quote from a route estimate. Pure and deterministic: all
 * rounding is done on integers, so the same route always yields the same total.
 */
export function computeFare(
  route: RouteEstimate,
  tariff: FareTariff = DEFAULT_TARIFF,
): FareQuote {
  const km = route.distanceMeters / 1000;
  const minutes = route.durationSeconds / 60;

  const baseFare = money(tariff.baseFareMinor, tariff.currency);
  const distanceComponent = money(
    Math.round(km * tariff.perKmMinor),
    tariff.currency,
  );
  const timeComponent = money(
    Math.round(minutes * tariff.perMinuteMinor),
    tariff.currency,
  );
  const total = addMoney(addMoney(baseFare, distanceComponent), timeComponent);

  return FareQuoteSchema.parse({
    currency: tariff.currency,
    baseFare,
    distanceComponent,
    timeComponent,
    total,
    distanceMeters: route.distanceMeters,
    durationSeconds: route.durationSeconds,
  });
}
