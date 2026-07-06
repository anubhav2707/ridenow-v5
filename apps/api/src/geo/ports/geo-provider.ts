import type { LngLat, RouteEstimate } from "@ridenow/shared-types";

/**
 * Port for geo services (routing + nearest-driver). The skeleton binds a
 * deterministic stub; the real OSRM/Nominatim adapter is deferred to the geo
 * story (self-hosting those is hours-long and out of scope for the skeleton).
 */
export interface GeoProvider {
  readonly name: string;
  estimateRoute(pickup: LngLat, dropoff: LngLat): Promise<RouteEstimate>;
  nearestDriverId(pickup: LngLat): Promise<string | null>;
}

export const GEO_PROVIDER = Symbol("GEO_PROVIDER");
