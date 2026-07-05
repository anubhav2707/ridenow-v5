import { Injectable } from "@nestjs/common";
import type { LngLat, RouteEstimate } from "@ridenow/shared-types";
import type { GeoProvider } from "./geo.port";

const EARTH_RADIUS_M = 6_371_000;
const ROAD_FACTOR = 1.3; // straight-line -> road distance fudge
const AVG_SPEED_MPS = 8.33; // ~30 km/h

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineMeters(a: LngLat, b: LngLat): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Deterministic mock geo provider — canned route estimates, zero network. */
@Injectable()
export class StubGeoProvider implements GeoProvider {
  async estimateRoute(pickup: LngLat, dropoff: LngLat): Promise<RouteEstimate> {
    const straight = haversineMeters(pickup, dropoff);
    const distanceMeters = Math.max(1, Math.round(straight * ROAD_FACTOR));
    const durationSeconds = Math.max(1, Math.round(distanceMeters / AVG_SPEED_MPS));
    return { distanceMeters, durationSeconds };
  }
}
