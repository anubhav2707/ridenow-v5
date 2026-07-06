import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  computeTakeHome,
  DEFAULT_COMMISSION_BPS,
  EarningsLedgerEntrySchema,
  type EarningsLedgerEntry,
  type Money,
} from "@ridenow/shared-types";

/**
 * The transparent earnings ledger. Each completed trip records exactly how the
 * gross fare split into platform commission and driver take-home. In-memory in
 * the skeleton; persisted to `earnings_ledger` in the earnings feature story.
 */
@Injectable()
export class EarningsService {
  private readonly entries: EarningsLedgerEntry[] = [];

  record(
    driverId: string,
    rideId: string,
    gross: Money,
    commissionBps: number = DEFAULT_COMMISSION_BPS,
  ): EarningsLedgerEntry {
    const { commission, netTakeHome } = computeTakeHome(gross, commissionBps);
    const entry = EarningsLedgerEntrySchema.parse({
      entryId: `led_${randomUUID()}`,
      driverId,
      rideId,
      gross,
      commission,
      netTakeHome,
      commissionBps,
      createdAt: new Date().toISOString(),
    });
    this.entries.push(entry);
    return entry;
  }

  ledgerFor(driverId: string): EarningsLedgerEntry[] {
    return this.entries.filter((e) => e.driverId === driverId);
  }
}
