import { Controller, Get } from "@nestjs/common";

/** Root descriptor so hitting the API in a browser explains what it is. */
@Controller()
export class AppController {
  @Get()
  root(): { service: string; version: string; endpoints: string[] } {
    return {
      service: "ridenow-api",
      version: "0.0.0",
      endpoints: ["/health", "POST /core-loop/run", "/drivers", "/rides", "/earnings"],
    };
  }
}
