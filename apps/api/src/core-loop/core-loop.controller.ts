import { Controller, HttpCode, Post } from "@nestjs/common";
import { CoreLoopService, type CoreLoopResult } from "./core-loop.service";

@Controller("core-loop")
export class CoreLoopController {
  constructor(private readonly service: CoreLoopService) {}

  /** Run the faked end-to-end trip loop and return the transitions + ledger. */
  @Post("run")
  @HttpCode(200)
  run(): Promise<CoreLoopResult> {
    return this.service.run();
  }
}
