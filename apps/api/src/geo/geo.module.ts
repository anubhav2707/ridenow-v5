import { Module } from "@nestjs/common";
import { GEO_PROVIDER, type GeoProvider } from "./geo.port";
import { StubGeoProvider } from "./stub-geo.provider";

/** Selects the geo adapter from GEO_PROVIDER (mock by default). */
function selectGeoProvider(): GeoProvider {
  const mode = process.env.GEO_PROVIDER ?? "mock";
  if (mode === "mock") return new StubGeoProvider();
  throw new Error(`GEO_PROVIDER="${mode}" is not implemented in the scaffold (deferred to the geo story)`);
}

@Module({
  providers: [{ provide: GEO_PROVIDER, useFactory: selectGeoProvider }],
  exports: [GEO_PROVIDER],
})
export class GeoModule {}
