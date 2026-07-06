import type { LngLat, RouteEstimate } from "@ridenow/shared-types";

/**
 * Port for route estimation. The scaffold ships a deterministic stub; a later
 * story swaps in a keyless OSRM adapter behind this same interface.
 */
export interface GeoProvider {
  route(pickup: LngLat, dropoff: LngLat): Promise<RouteEstimate>;
}

export const GEO_PROVIDER = Symbol("GEO_PROVIDER");
