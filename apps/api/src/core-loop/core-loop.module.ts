import { Module } from "@nestjs/common";
import { CoreLoopService } from "./core-loop.service";
import { CoreLoopController } from "./core-loop.controller";

@Module({
  controllers: [CoreLoopController],
  providers: [CoreLoopService],
  exports: [CoreLoopService],
})
export class CoreLoopModule {}
