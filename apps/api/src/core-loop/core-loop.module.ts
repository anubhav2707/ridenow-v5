import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { GeoModule } from "../geo/geo.module";
import { PaymentsModule } from "../payments/payments.module";
import { CoreLoopController } from "./core-loop.controller";
import { CoreLoopService } from "./core-loop.service";
import { CORE_LOOP_STORE, PgCoreLoopStore } from "./core-loop.store";

@Module({
  imports: [GeoModule, PaymentsModule, AuthModule],
  controllers: [CoreLoopController],
  providers: [CoreLoopService, { provide: CORE_LOOP_STORE, useClass: PgCoreLoopStore }],
})
export class CoreLoopModule {}
