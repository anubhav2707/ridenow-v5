import { Injectable } from "@nestjs/common";
import type { LngLat, RouteEstimate } from "@ridenow/shared-types";
import type { GeoProvider } from "../ports/geo-provider";

/**
 * Deterministic MOCK geo adapter. Returns a fixed 5km / 10min route and a
 * canned nearest-driver id so the faked core loop and the fare quote are
 * reproducible without OSRM/Nominatim.
 */
@Injectable()
export class StubGeoProvider implements GeoProvider {
  readonly name = "stub";

  async estimateRoute(
    _pickup: LngLat,
    _dropoff: LngLat,
  ): Promise<RouteEstimate> {
    return { distanceMeters: 5000, durationSeconds: 600 };
  }

  async nearestDriverId(_pickup: LngLat): Promise<string | null> {
    return "seed-driver-ada";
  }
}
