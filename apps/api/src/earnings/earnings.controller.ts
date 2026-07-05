import { Controller, Get, Param } from "@nestjs/common";
import { EarningsService } from "./earnings.service";

@Controller("earnings")
export class EarningsController {
  constructor(private readonly earnings: EarningsService) {}

  /** The driver's transparent take-home ledger. */
  @Get(":driverId")
  ledger(@Param("driverId") driverId: string) {
    return this.earnings.getLedger(driverId);
  }
}
