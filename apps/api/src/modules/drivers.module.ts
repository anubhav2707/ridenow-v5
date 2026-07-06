import { Controller, Get, Module } from "@nestjs/common";

interface StubInfo {
  module: string;
  status: "stub";
  story: string;
}

@Controller("drivers")
class DriversController {
  @Get()
  info(): StubInfo {
    return { module: "drivers", status: "stub", story: "mock-KYC onboarding + availability" };
  }
}

@Module({ controllers: [DriversController] })
export class DriversModule {}
