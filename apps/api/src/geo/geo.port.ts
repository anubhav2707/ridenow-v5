import type { LngLat, RouteEstimate } from "@ridenow/shared-types";

/** DI token for the geo provider port. */
export const GEO_PROVIDER = Symbol("GEO_PROVIDER");

/**
 * Port for routing/geocoding. The mock adapter returns canned estimates; the
 * real OSRM/Nominatim adapter is deferred to the geo story (a DI swap, not a
 * refactor).
 */
export interface GeoProvider {
  estimateRoute(pickup: LngLat, dropoff: LngLat): Promise<RouteEstimate>;
}
