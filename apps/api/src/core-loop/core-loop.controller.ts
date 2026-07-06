import { Controller, Post } from "@nestjs/common";
import { CoreLoopService, type CoreLoopResult } from "./core-loop.service";

@Controller("core-loop")
export class CoreLoopController {
  constructor(private readonly loop: CoreLoopService) {}

  /** Drive one faked ride end-to-end. Exercised by scripts/watch-loop.sh. */
  @Post("run")
  run(): Promise<CoreLoopResult> {
    return this.loop.run();
  }
}
