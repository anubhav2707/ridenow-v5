import { Module } from "@nestjs/common";
import { AppConfig } from "../config/app-config";
import { GEO_PROVIDER } from "./geo.port";
import { StubGeoProvider } from "./stub-geo.provider";

@Module({
  providers: [
    StubGeoProvider,
    {
      provide: GEO_PROVIDER,
      inject: [AppConfig, StubGeoProvider],
      useFactory: (cfg: AppConfig, stub: StubGeoProvider) => {
        if (cfg.geoProvider === "mock") return stub;
        throw new Error(
          `GEO_PROVIDER='${cfg.geoProvider}' is not implemented yet (real OSRM/Nominatim is deferred to the geo story)`,
        );
      },
    },
  ],
  exports: [GEO_PROVIDER],
})
export class GeoModule {}
