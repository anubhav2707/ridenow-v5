import { Logger } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server } from "socket.io";
import { LocationPingSchema } from "@ridenow/shared-types";

/**
 * Stubbed live-tracking gateway so driver GPS has a home from day one. It
 * validates and re-broadcasts location pings; the map subscription / room fan-out
 * lands with the live-tracking story.
 */
@WebSocketGateway({ cors: true, namespace: "/tracking" })
export class TrackingGateway {
  private readonly logger = new Logger("TrackingGateway");

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("driver:location")
  handleLocation(@MessageBody() body: unknown): { ok: boolean } {
    const parsed = LocationPingSchema.safeParse(body);
    if (!parsed.success) {
      this.logger.warn("rejected malformed location ping");
      return { ok: false };
    }
    this.server.emit(`ride:${parsed.data.driverId}:location`, parsed.data);
    return { ok: true };
  }
}
