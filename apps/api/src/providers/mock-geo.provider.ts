import { Injectable } from "@nestjs/common";
import type { LngLat, RouteEstimate } from "@ridenow/shared-types";
import type { GeoPort } from "./ports";

/**
 * Stub geo adapter: a deterministic haversine distance at a fixed average speed.
 * The real OSRM/Nominatim adapter is deferred to the geo story.
 */
@Injectable()
export class MockGeoProvider implements GeoPort {
  private static readonly AVG_SPEED_MPS = 8.33; // ~30 km/h city average

  async estimateRoute(pickup: LngLat, dropoff: LngLat): Promise<RouteEstimate> {
    const distanceMeters = Math.round(haversineMeters(pickup, dropoff));
    const durationSeconds = Math.max(
      60,
      Math.round(distanceMeters / MockGeoProvider.AVG_SPEED_MPS),
    );
    return { distanceMeters, durationSeconds };
  }
}

function haversineMeters(a: LngLat, b: LngLat): number {
  const R = 6_371_000;
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
