import { Module } from "@nestjs/common";
import { EarningsService } from "./earnings.service";

@Module({
  providers: [EarningsService],
  exports: [EarningsService],
})
export class EarningsModule {}
