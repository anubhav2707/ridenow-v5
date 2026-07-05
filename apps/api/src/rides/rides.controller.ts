import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { parseBody } from "../common/zod";
import { RidesService } from "./rides.service";
import { QuoteRequestSchema, StartRequestSchema } from "./dto";

/**
 * HTTP surface for the faked core loop. scripts/watch-loop.sh drives these in
 * order to print the trip-state transitions and the resulting ledger entry.
 */
@Controller("rides")
export class RidesController {
  constructor(private readonly rides: RidesService) {}

  @Post("quote")
  quote(@Body() body: unknown) {
    const { pickup, dropoff } = parseBody(QuoteRequestSchema, body);
    return this.rides.quote(pickup, dropoff);
  }

  @Post(":id/book")
  book(@Param("id") id: string) {
    return this.rides.book(id);
  }

  @Post(":id/accept")
  accept(@Param("id") id: string) {
    return this.rides.accept(id);
  }

  @Post(":id/start")
  start(@Param("id") id: string, @Body() body: unknown) {
    const { otp } = parseBody(StartRequestSchema, body);
    return this.rides.start(id, otp);
  }

  @Post(":id/complete")
  complete(@Param("id") id: string) {
    return this.rides.complete(id);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.rides.getRide(id);
  }
}
