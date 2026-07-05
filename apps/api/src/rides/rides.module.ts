import { Module } from "@nestjs/common";
import { GeoModule } from "../geo/geo.module";
import { DriversModule } from "../drivers/drivers.module";
import { EarningsModule } from "../earnings/earnings.module";
import { RidesService } from "./rides.service";
import { RidesController } from "./rides.controller";

@Module({
  imports: [GeoModule, DriversModule, EarningsModule],
  providers: [RidesService],
  controllers: [RidesController],
  exports: [RidesService],
})
export class RidesModule {}
