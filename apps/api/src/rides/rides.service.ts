import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  applyEvent,
  computeFare,
  type EarningsLedgerEntry,
  type FareQuote,
  type LngLat,
  type TripState,
} from "@ridenow/shared-types";
import { GEO_PROVIDER, type GeoProvider } from "../geo/geo.port";
import { DriversService } from "../drivers/drivers.service";
import { EarningsService } from "../earnings/earnings.service";

/** Deterministic trip-start OTP in mock mode. */
const MOCK_TRIP_OTP = "0000";

interface RideRecord {
  id: string;
  state: TripState;
  history: TripState[];
  pickup: LngLat;
  dropoff: LngLat;
  quote: FareQuote | null;
  driverId: string | null;
  startOtp: string | null;
}

export interface RideView {
  rideId: string;
  state: TripState;
  history: TripState[];
  quote: FareQuote | null;
  driverId: string | null;
}

export interface AcceptResult extends RideView {
  startOtp: string;
}

export interface CompleteResult extends RideView {
  ledgerEntry: EarningsLedgerEntry;
}

/**
 * The faked core loop over the mock adapters. Real state-machine transitions
 * from @ridenow/shared-types drive the lifecycle; external calls are canned.
 * In-memory only — persistence lands in the rides story.
 */
@Injectable()
export class RidesService {
  private readonly rides = new Map<string, RideRecord>();

  constructor(
    @Inject(GEO_PROVIDER) private readonly geo: GeoProvider,
    private readonly drivers: DriversService,
    private readonly earnings: EarningsService,
  ) {}

  /** new -> requested -> quoted, returning the upfront transparent fare. */
  async quote(pickup: LngLat, dropoff: LngLat): Promise<RideView> {
    const id = randomUUID();
    let state: TripState = "new";
    const history: TripState[] = [state];

    state = applyEvent(state, "REQUEST");
    history.push(state);

    const route = await this.geo.estimateRoute(pickup, dropoff);
    const quote = computeFare(route);

    state = applyEvent(state, "QUOTE");
    history.push(state);

    const record: RideRecord = {
      id,
      state,
      history,
      pickup,
      dropoff,
      quote,
      driverId: null,
      startOtp: null,
    };
    this.rides.set(id, record);
    return this.view(record);
  }

  book(rideId: string): RideView {
    const record = this.require(rideId);
    this.advance(record, "BOOK");
    return this.view(record);
  }

  accept(rideId: string): AcceptResult {
    const record = this.require(rideId);
    const driver = this.drivers.assignNearest(record.pickup);
    record.driverId = driver.id;
    record.startOtp = MOCK_TRIP_OTP;
    this.advance(record, "ACCEPT");
    return { ...this.view(record), startOtp: record.startOtp };
  }

  start(rideId: string, otp: string): RideView {
    const record = this.require(rideId);
    if (otp !== record.startOtp) {
      throw new BadRequestException("invalid trip-start OTP");
    }
    this.advance(record, "START");
    return this.view(record);
  }

  complete(rideId: string): CompleteResult {
    const record = this.require(rideId);
    if (!record.driverId || !record.quote) {
      throw new BadRequestException("ride is not ready to complete");
    }
    this.advance(record, "COMPLETE");
    const ledgerEntry = this.earnings.recordTrip(record.driverId, record.id, record.quote.total);
    return { ...this.view(record), ledgerEntry };
  }

  getRide(rideId: string): RideView {
    return this.view(this.require(rideId));
  }

  private advance(record: RideRecord, event: Parameters<typeof applyEvent>[1]): void {
    record.state = applyEvent(record.state, event);
    record.history.push(record.state);
  }

  private require(rideId: string): RideRecord {
    const record = this.rides.get(rideId);
    if (!record) {
      throw new NotFoundException(`ride ${rideId} not found`);
    }
    return record;
  }

  private view(record: RideRecord): RideView {
    return {
      rideId: record.id,
      state: record.state,
      history: [...record.history],
      quote: record.quote,
      driverId: record.driverId,
    };
  }
}
