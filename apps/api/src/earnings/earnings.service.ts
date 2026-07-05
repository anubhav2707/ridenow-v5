import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  computeTakeHome,
  type EarningsLedgerEntry,
  type Money,
} from "@ridenow/shared-types";
import { AppConfig } from "../config/app-config";

/**
 * Transparent earnings ledger, faked in memory. Records exactly how each trip's
 * gross fare splits into platform commission and driver take-home.
 */
@Injectable()
export class EarningsService {
  private readonly ledger = new Map<string, EarningsLedgerEntry[]>();

  constructor(private readonly cfg: AppConfig) {}

  recordTrip(driverId: string, rideId: string, gross: Money): EarningsLedgerEntry {
    const { commission, netTakeHome } = computeTakeHome(gross, this.cfg.commissionBps);
    const entry: EarningsLedgerEntry = {
      entryId: randomUUID(),
      driverId,
      rideId,
      gross,
      commission,
      netTakeHome,
      commissionBps: this.cfg.commissionBps,
      createdAt: new Date().toISOString(),
    };
    const existing = this.ledger.get(driverId) ?? [];
    existing.push(entry);
    this.ledger.set(driverId, existing);
    return entry;
  }

  getLedger(driverId: string): EarningsLedgerEntry[] {
    return this.ledger.get(driverId) ?? [];
  }
}
