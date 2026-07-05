import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { PaymentsModule } from "./payments/payments.module";
import { GeoModule } from "./geo/geo.module";
import { DriversModule } from "./drivers/drivers.module";
import { EarningsModule } from "./earnings/earnings.module";
import { RidesModule } from "./rides/rides.module";
import { TrackingModule } from "./tracking/tracking.module";

@Module({
  imports: [
    ConfigModule,
    HealthModule,
    AuthModule,
    PaymentsModule,
    GeoModule,
    DriversModule,
    EarningsModule,
    RidesModule,
    TrackingModule,
  ],
})
export class AppModule {}
