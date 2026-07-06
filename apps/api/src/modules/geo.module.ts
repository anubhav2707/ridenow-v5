import { Controller, Get, Module } from "@nestjs/common";

interface StubInfo {
  module: string;
  status: "stub";
  story: string;
}

@Controller("geo")
class GeoController {
  @Get()
  info(): StubInfo {
    return { module: "geo", status: "stub", story: "OSRM/Nominatim routing + nearest-driver" };
  }
}

/** Stub home for geo. Injects GEO_PROVIDER in its feature story. */
@Module({ controllers: [GeoController] })
export class GeoModule {}
