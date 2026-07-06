import { Controller, Get, Module } from "@nestjs/common";

interface StubInfo {
  module: string;
  status: "stub";
  story: string;
}

@Controller("rides")
class RidesController {
  @Get()
  info(): StubInfo {
    return { module: "rides", status: "stub", story: "quote -> book -> trip state machine" };
  }
}

@Module({ controllers: [RidesController] })
export class RidesModule {}
