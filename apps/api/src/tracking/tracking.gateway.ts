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
 * Live-tracking gateway (Socket.IO). A stub home for driver GPS pings so the
 * live-tracking story has a place to land; it validates a ping and re-broadcasts
 * it to riders watching that driver. Real presence/room logic lands later.
 */
@WebSocketGateway({ cors: { origin: true }, namespace: "/tracking" })
export class TrackingGateway {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger("TrackingGateway");

  @SubscribeMessage("driver:ping")
  handlePing(@MessageBody() body: unknown): { ok: boolean } {
    const parsed = LocationPingSchema.safeParse(body);
    if (!parsed.success) {
      return { ok: false };
    }
    const ping = parsed.data;
    this.logger.debug(`ping from ${ping.driverId}`);
    this.server?.emit(`driver:${ping.driverId}:location`, ping);
    return { ok: true };
  }
}
