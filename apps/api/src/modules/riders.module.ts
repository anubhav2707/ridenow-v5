import { Controller, Get, Module } from "@nestjs/common";

interface StubInfo {
  module: string;
  status: "stub";
  story: string;
}

@Controller("riders")
class RidersController {
  @Get()
  info(): StubInfo {
    return { module: "riders", status: "stub", story: "rider profile + booking" };
  }
}

@Module({ controllers: [RidersController] })
export class RidersModule {}
