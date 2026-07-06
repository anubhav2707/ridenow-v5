import { z } from "zod";
import { MoneySchema, applyBasisPoints, subtractMoney, type Money } from "./money.js";

/** Platform take rate in basis points (2000 bps === 20%). */
export const DEFAULT_COMMISSION_BPS = 2000;

/**
 * One row of the driver's transparent earnings ledger: exactly how a trip's
 * fare breaks down into platform commission and driver take-home.
 */
export const EarningsLedgerEntrySchema = z.object({
  entryId: z.string().min(1),
  driverId: z.string().min(1),
  rideId: z.string().min(1),
  gross: MoneySchema,
  commission: MoneySchema,
  netTakeHome: MoneySchema,
  commissionBps: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export type EarningsLedgerEntry = z.infer<typeof EarningsLedgerEntrySchema>;

export interface TakeHome {
  commission: Money;
  netTakeHome: Money;
}

/**
 * Split a gross fare into commission + driver take-home. Commission is rounded
 * to the nearest minor unit and take-home is the exact remainder, so the two
 * always sum back to the gross with no rounding drift.
 */
export function computeTakeHome(gross: Money, commissionBps = DEFAULT_COMMISSION_BPS): TakeHome {
  const commission = applyBasisPoints(gross, commissionBps);
  const netTakeHome = subtractMoney(gross, commission);
  return { commission, netTakeHome };
}
