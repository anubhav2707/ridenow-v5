import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { ProvidersModule } from "./providers/providers.module";
import { CoreLoopModule } from "./core-loop/core-loop.module";
import { TrackingModule } from "./tracking/tracking.module";
import { AuthModule } from "./modules/auth.module";
import { RidersModule } from "./modules/riders.module";
import { DriversModule } from "./modules/drivers.module";
import { RidesModule } from "./modules/rides.module";
import { PaymentsModule } from "./modules/payments.module";
import { GeoModule } from "./modules/geo.module";
import { EarningsModule } from "./modules/earnings.module";

/**
 * Root module. The domain modules below are structural stubs — one per downstream
 * feature story — that already sit on the ports-and-adapters wiring (ProvidersModule)
 * so a story only has to fill in behaviour, never re-plumb the boundaries.
 */
@Module({
  imports: [
    ProvidersModule,
    HealthModule,
    CoreLoopModule,
    TrackingModule,
    AuthModule,
    RidersModule,
    DriversModule,
    RidesModule,
    PaymentsModule,
    GeoModule,
    EarningsModule,
  ],
})
export class AppModule {}
