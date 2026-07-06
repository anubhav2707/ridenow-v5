import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { RidesModule } from "./rides/rides.module";
import { DriversModule } from "./drivers/drivers.module";
import { PaymentsModule } from "./payments/payments.module";
import { GeoModule } from "./geo/geo.module";
import { EarningsModule } from "./earnings/earnings.module";
import { TrackingModule } from "./tracking/tracking.module";
import { CoreLoopModule } from "./core-loop/core-loop.module";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    RidesModule,
    DriversModule,
    PaymentsModule,
    GeoModule,
    EarningsModule,
    TrackingModule,
    CoreLoopModule,
  ],
})
export class AppModule {}
