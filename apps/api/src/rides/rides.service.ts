import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { applyEvent, type TripEvent, type TripState } from "@ridenow/shared-types";

export interface Ride {
  id: string;
  state: TripState;
}

/**
 * Ride lifecycle over the shared trip state machine. In-memory in the skeleton;
 * persisted to the `rides` table (with real transition guards) in the rides
 * feature story. The state machine itself lives in @ridenow/shared-types so all
 * three apps agree on the legal transitions.
 */
@Injectable()
export class RidesService {
  private readonly rides = new Map<string, Ride>();

  create(): Ride {
    const ride: Ride = { id: `ride_${randomUUID()}`, state: "new" };
    this.rides.set(ride.id, ride);
    return ride;
  }

  apply(rideId: string, event: TripEvent): Ride {
    const ride = this.rides.get(rideId);
    if (!ride) {
      throw new NotFoundException(`unknown ride ${rideId}`);
    }
    ride.state = applyEvent(ride.state, event);
    return ride;
  }

  get(rideId: string): Ride | undefined {
    return this.rides.get(rideId);
  }
}
