import { Inject, Injectable } from "@nestjs/common";
import {
  DEFAULT_COMMISSION_BPS,
  computeFare,
  computeTakeHome,
  formatMoney,
  applyEvent,
  type EarningsLedgerEntry,
  type FareQuote,
  type TripEvent,
  type TripState,
} from "@ridenow/shared-types";
import {
  GEO_PROVIDER,
  OTP_PROVIDER,
  PAYMENT_PROVIDER,
  type GeoPort,
  type OtpPort,
  type PaymentPort,
  type PaymentResult,
} from "../providers/ports";

export interface CoreLoopResult {
  transitions: TripState[];
  quote: FareQuote;
  payment: PaymentResult;
  ledgerEntry: EarningsLedgerEntry;
  otp: { sentTo: string; devCode: string };
}

const DRIVE_EVENTS: readonly TripEvent[] = [
  "REQUEST",
  "QUOTE",
  "BOOK",
  "ACCEPT",
  "START",
  "COMPLETE",
];

// Fixed demo pickup/dropoff near SF (matches the seeded drivers).
const PICKUP = { lng: -122.4194, lat: 37.7749 };
const DROPOFF = { lng: -122.4094, lat: 37.7849 };

/**
 * The FAKED vertical slice of the core loop. Real trip-state-machine transitions
 * and real money math run over the deterministic MOCK adapters — no DB writes,
 * no external calls. This is what makes the loop "runnable end-to-end even faked".
 */
@Injectable()
export class CoreLoopService {
  constructor(
    @Inject(OTP_PROVIDER) private readonly otp: OtpPort,
    @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentPort,
    @Inject(GEO_PROVIDER) private readonly geo: GeoPort,
  ) {}

  async run(): Promise<CoreLoopResult> {
    const phone = "+15551230001";
    const otp = await this.otp.sendOtp(phone);
    await this.otp.verifyOtp(phone, otp.devCode);

    const route = await this.geo.estimateRoute(PICKUP, DROPOFF);
    const quote = computeFare(route);

    let state: TripState = "new";
    const transitions: TripState[] = [state];
    for (const event of DRIVE_EVENTS) {
      state = applyEvent(state, event);
      transitions.push(state);
    }

    const rideId = "ride-demo";
    const payment = await this.payments.charge(quote.total, rideId);
    const { commission, netTakeHome } = computeTakeHome(quote.total);

    const ledgerEntry: EarningsLedgerEntry = {
      entryId: "ledger-demo",
      driverId: "driver-demo",
      rideId,
      gross: quote.total,
      commission,
      netTakeHome,
      commissionBps: DEFAULT_COMMISSION_BPS,
      createdAt: new Date().toISOString(),
    };

    return { transitions, quote, payment, ledgerEntry, otp };
  }

  /** A ready-made human-readable summary for scripts/watch-loop.sh (text/plain). */
  async runText(): Promise<string> {
    const r = await this.run();
    return [
      "RideNow v5 — faked core loop (mock adapters, no secrets)",
      `otp:        sent to ${r.otp.sentTo}, dev code ${r.otp.devCode}`,
      `trip state: ${r.transitions.join(" -> ")}`,
      `fare:       total ${formatMoney(r.quote.total)} ` +
        `(base ${formatMoney(r.quote.baseFare)} + dist ${formatMoney(r.quote.distanceComponent)} + time ${formatMoney(r.quote.timeComponent)})`,
      `payment:    ${r.payment.paymentId} ${r.payment.status} ${formatMoney(r.payment.amount)}`,
      `earnings:   gross ${formatMoney(r.ledgerEntry.gross)}, ` +
        `commission ${formatMoney(r.ledgerEntry.commission)} (${r.ledgerEntry.commissionBps} bps), ` +
        `net take-home ${formatMoney(r.ledgerEntry.netTakeHome)}`,
      "",
    ].join("\n");
  }
}
