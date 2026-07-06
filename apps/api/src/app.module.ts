import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CoreLoopModule } from "./core-loop/core-loop.module";
import { DatabaseModule } from "./database/database.module";
import { DriversModule } from "./drivers/drivers.module";
import { EarningsModule } from "./earnings/earnings.module";
import { GeoModule } from "./geo/geo.module";
import { HealthModule } from "./health/health.module";
import { PaymentsModule } from "./payments/payments.module";
import { RidesModule } from "./rides/rides.module";
import { TrackingModule } from "./tracking/tracking.module";

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    GeoModule,
    PaymentsModule,
    DriversModule,
    RidesModule,
    EarningsModule,
    TrackingModule,
    CoreLoopModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
