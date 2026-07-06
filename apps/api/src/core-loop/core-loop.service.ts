import { Injectable } from "@nestjs/common";
import type {
  EarningsLedgerEntry,
  FareQuote,
  LngLat,
  TripState,
} from "@ridenow/shared-types";
import { RidesService } from "../rides/rides.service";
import { GeoService } from "../geo/geo.service";
import { PaymentsService } from "../payments/payments.service";
import { DriversService } from "../drivers/drivers.service";
import { EarningsService } from "../earnings/earnings.service";

export interface CoreLoopResult {
  rideId: string;
  transitions: TripState[];
  quote: FareQuote;
  driverId: string;
  authorizationId: string;
  ledgerEntry: EarningsLedgerEntry;
}

const PICKUP: LngLat = { lng: -122.4194, lat: 37.7749 };
const DROPOFF: LngLat = { lng: -122.4094, lat: 37.7849 };

/**
 * The FAKED core loop: a real vertical slice that drives one ride through the
 * shared trip state machine (new -> requested -> quoted -> booked -> accepted ->
 * started -> completed) over the MOCK adapters (stub geo, fake payments), then
 * records the earnings ledger entry. No product features — just proof the
 * boundaries fit together end-to-end.
 */
@Injectable()
export class CoreLoopService {
  constructor(
    private readonly rides: RidesService,
    private readonly geo: GeoService,
    private readonly payments: PaymentsService,
    private readonly drivers: DriversService,
    private readonly earnings: EarningsService,
  ) {}

  async run(): Promise<CoreLoopResult> {
    const ride = this.rides.create(); // 'new'
    const transitions: TripState[] = [ride.state];

    transitions.push(this.rides.apply(ride.id, "REQUEST").state);

    const quote = await this.geo.quote(PICKUP, DROPOFF);
    transitions.push(this.rides.apply(ride.id, "QUOTE").state);

    const auth = await this.payments.authorize(quote.total, ride.id);
    transitions.push(this.rides.apply(ride.id, "BOOK").state);

    const driverId =
      (await this.geo.nearestDriverId(PICKUP)) ?? "seed-driver-ada";
    this.drivers.acceptRide(driverId, ride.id);
    transitions.push(this.rides.apply(ride.id, "ACCEPT").state);

    // OTP trip start (mocked) then GPS/drive.
    transitions.push(this.rides.apply(ride.id, "START").state);

    await this.payments.capture(auth.authorizationId);
    transitions.push(this.rides.apply(ride.id, "COMPLETE").state);

    const ledgerEntry = this.earnings.record(driverId, ride.id, quote.total);

    return {
      rideId: ride.id,
      transitions,
      quote,
      driverId,
      authorizationId: auth.authorizationId,
      ledgerEntry,
    };
  }
}
