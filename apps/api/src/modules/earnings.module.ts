import { Controller, Get, Module } from "@nestjs/common";

interface StubInfo {
  module: string;
  status: "stub";
  story: string;
}

@Controller("earnings")
class EarningsController {
  @Get()
  info(): StubInfo {
    return { module: "earnings", status: "stub", story: "transparent take-home ledger" };
  }
}

@Module({ controllers: [EarningsController] })
export class EarningsModule {}
