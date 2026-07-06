import { Module } from "@nestjs/common";
import { GeoService } from "./geo.service";
import { GEO_PROVIDER } from "./ports/geo-provider";
import { StubGeoProvider } from "./adapters/stub-geo.provider";

@Module({
  providers: [
    GeoService,
    { provide: GEO_PROVIDER, useClass: StubGeoProvider },
  ],
  exports: [GeoService],
})
export class GeoModule {}
