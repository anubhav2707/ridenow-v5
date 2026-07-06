import { Controller, Get, Header } from "@nestjs/common";
import { CoreLoopService, type CoreLoopResult } from "./core-loop.service";

@Controller("loop")
export class CoreLoopController {
  constructor(private readonly loop: CoreLoopService) {}

  /** GET /loop/run — the faked core loop as structured JSON. */
  @Get("run")
  run(): Promise<CoreLoopResult> {
    return this.loop.run();
  }

  /** GET /loop/watch — the same loop as a human-readable text summary. */
  @Get("watch")
  @Header("content-type", "text/plain; charset=utf-8")
  watch(): Promise<string> {
    return this.loop.runText();
  }
}
