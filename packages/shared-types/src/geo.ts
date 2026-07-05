import { z } from "zod";

/**
 * A WGS-84 coordinate. Order is [lng, lat] on the wire to match GeoJSON and the
 * PostGIS `geography(Point,4326)` column that the drivers table carries.
 */
export const LngLatSchema = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
});

export type LngLat = z.infer<typeof LngLatSchema>;

/** A single driver GPS ping used by the live-tracking gateway. */
export const LocationPingSchema = z.object({
  driverId: z.string().min(1),
  at: LngLatSchema,
  /** Unix epoch millis. Supplied by the caller (clock lives outside this pkg). */
  timestamp: z.number().int().nonnegative(),
});

export type LocationPing = z.infer<typeof LocationPingSchema>;
