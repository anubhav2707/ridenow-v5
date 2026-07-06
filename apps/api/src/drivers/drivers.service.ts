import { Injectable } from "@nestjs/common";

/**
 * Driver-side stub. The skeleton only needs "a driver accepts the ride" for the
 * faked loop; mock-KYC onboarding + real accept/decline land in the driver
 * feature story.
 */
@Injectable()
export class DriversService {
  acceptRide(driverId: string, rideId: string): { driverId: string; rideId: string; accepted: true } {
    return { driverId, rideId, accepted: true };
  }
}
