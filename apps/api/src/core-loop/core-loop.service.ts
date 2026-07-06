import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  DEFAULT_COMMISSION_BPS,
  HAPPY_PATH,
  applyEvent,
  computeFare,
  computeTakeHome,
  type FareQuote,
  type LngLat,
  type TripEvent,
  type TripState,
} from "@ridenow/shared-types";
import { OTP_PROVIDER, type OtpProvider } from "../auth/otp.port";
import { GEO_PROVIDER, type GeoProvider } from "../geo/geo.port";
import { PAYMENT_PROVIDER, type PaymentProvider } from "../payments/payment.port";
import { CORE_LOOP_STORE, type CoreLoopStore, type StoredLedgerEntry } from "./core-loop.store";

export interface TransitionLog {
  event: TripEvent;
  from: TripState;
  to: TripState;
}

export interface CoreLoopResult {
  rideId: string;
  states: TripState[];
  transitions: TransitionLog[];
  quote: FareQuote;
  payment: { id: string; status: "succeeded" };
  ledgerEntry: StoredLedgerEntry;
}

// Canned pickup/dropoff (near the seeded SF drivers) so the loop is deterministic.
const PICKUP: LngLat = { lng: -122.4194, lat: 37.7749 };
const DROPOFF: LngLat = { lng: -122.4084, lat: 37.7859 };
const RIDER_PHONE = "+15551230001";

const HAPPY_EVENTS: TripEvent[] = ["REQUEST", "QUOTE", "BOOK", "ACCEPT", "START", "COMPLETE"];

/**
 * The FAKED vertical slice: drives one ride through the real trip state machine
 * end-to-end over the mock provider ports, persisting each transition and the
 * resulting earnings ledger entry. No product features — just proof the wiring
 * and contracts line up across the whole stack.
 */
@Injectable()
export class CoreLoopService {
  private readonly logger = new Logger(CoreLoopService.name);

  constructor(
    @Inject(GEO_PROVIDER) private readonly geo: GeoProvider,
    @Inject(PAYMENT_PROVIDER) private readonly payments: PaymentProvider,
    @Inject(OTP_PROVIDER) private readonly otp: OtpProvider,
    @Inject(CORE_LOOP_STORE) private readonly store: CoreLoopStore,
  ) {}

  async run(): Promise<CoreLoopResult> {
    const route = await this.geo.route(PICKUP, DROPOFF);
    const quote = computeFare(route);

    const driverId = await this.store.pickOnlineDriver();
    const ride = await this.store.createRide({ pickup: PICKUP, dropoff: DROPOFF, currency: quote.currency });

    const transitions: TransitionLog[] = [];
    let state: TripState = "new";
    for (const event of HAPPY_EVENTS) {
      const from = state;
      const to = applyEvent(from, event);
      await this.applySideEffects(event, to, ride.id, driverId, quote);
      transitions.push({ event, from, to });
      state = to;
    }

    const payment = await this.payments.charge(quote.total, ride.id);
    const { commission, netTakeHome } = computeTakeHome(quote.total, DEFAULT_COMMISSION_BPS);
    const ledgerEntry = await this.store.recordEarnings({
      driverId,
      rideId: ride.id,
      gross: quote.total,
      commission,
      netTakeHome,
      commissionBps: DEFAULT_COMMISSION_BPS,
    });

    this.logger.log(
      `core loop complete for ride ${ride.id}: gross ${quote.total.amount} -> net ${netTakeHome.amount} ${quote.currency}`,
    );

    return {
      rideId: ride.id,
      states: [...HAPPY_PATH],
      transitions,
      quote,
      payment: { id: payment.id, status: payment.status },
      ledgerEntry,
    };
  }

  /** Wire each transition's real-world effect to the mock adapter that owns it. */
  private async applySideEffects(
    event: TripEvent,
    to: TripState,
    rideId: string,
    driverId: string,
    quote: FareQuote,
  ): Promise<void> {
    switch (event) {
      case "QUOTE":
        await this.store.setRideState(rideId, to, quote.total.amount);
        return;
      case "ACCEPT":
        await this.store.assignDriver(rideId, driverId);
        await this.store.setRideState(rideId, to);
        return;
      case "START":
        await this.otp.send(RIDER_PHONE); // faked trip-start OTP
        await this.store.setRideState(rideId, to);
        return;
      default:
        await this.store.setRideState(rideId, to);
    }
  }
}
