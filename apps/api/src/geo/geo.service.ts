import { Inject, Injectable } from "@nestjs/common";
import {
  computeFare,
  type FareQuote,
  type LngLat,
} from "@ridenow/shared-types";
import { GEO_PROVIDER, type GeoProvider } from "./ports/geo-provider";

@Injectable()
export class GeoService {
  constructor(@Inject(GEO_PROVIDER) private readonly geo: GeoProvider) {}

  /** Transparent upfront quote for a pickup->dropoff route. */
  async quote(pickup: LngLat, dropoff: LngLat): Promise<FareQuote> {
    const route = await this.geo.estimateRoute(pickup, dropoff);
    return computeFare(route);
  }

  nearestDriverId(pickup: LngLat): Promise<string | null> {
    return this.geo.nearestDriverId(pickup);
  }
}
