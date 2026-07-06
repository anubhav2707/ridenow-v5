import { Module } from "@nestjs/common";
import { CoreLoopService } from "./core-loop.service";
import { CoreLoopController } from "./core-loop.controller";
import { RidesModule } from "../rides/rides.module";
import { GeoModule } from "../geo/geo.module";
import { PaymentsModule } from "../payments/payments.module";
import { DriversModule } from "../drivers/drivers.module";
import { EarningsModule } from "../earnings/earnings.module";

@Module({
  imports: [
    RidesModule,
    GeoModule,
    PaymentsModule,
    DriversModule,
    EarningsModule,
  ],
  controllers: [CoreLoopController],
  providers: [CoreLoopService],
})
export class CoreLoopModule {}
