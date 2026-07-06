import { Injectable } from "@nestjs/common";
import type { LngLat, RouteEstimate } from "@ridenow/shared-types";
import type { GeoProvider } from "./geo.port";

const EARTH_RADIUS_M = 6_371_000;
const ASSUMED_SPEED_MPS = 8.33; // ~30 km/h city average

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in metres between two WGS-84 points. */
function haversineMeters(a: LngLat, b: LngLat): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Deterministic geo stub: straight-line distance scaled to a road factor and a
 * fixed average speed. Same input -> same estimate, so the faked core loop and
 * its fare quote are reproducible with zero external calls.
 */
@Injectable()
export class StubGeoProvider implements GeoProvider {
  route(pickup: LngLat, dropoff: LngLat): Promise<RouteEstimate> {
    const straight = haversineMeters(pickup, dropoff);
    const distanceMeters = Math.max(500, Math.round(straight * 1.3)); // road detour factor
    const durationSeconds = Math.round(distanceMeters / ASSUMED_SPEED_MPS);
    return Promise.resolve({ distanceMeters, durationSeconds });
  }
}
