import { Logger } from "@nestjs/common";
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server } from "socket.io";
import { LocationPingSchema } from "@ridenow/shared-types";
import { parseBody } from "../common/zod";

/**
 * Live-GPS tracking gateway (stub). Gives driver location pings a home so the
 * live-tracking story wires the rider map to real broadcasts without moving the
 * transport. Socket.IO is loaded only when the app actually listens.
 */
@WebSocketGateway({ cors: { origin: "*" } })
export class TrackingGateway {
  private readonly logger = new Logger("TrackingGateway");

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage("location:update")
  onLocationUpdate(@MessageBody() body: unknown): { ok: true } {
    const ping = parseBody(LocationPingSchema, body);
    this.logger.debug(`location ${ping.driverId} -> ${ping.at.lng},${ping.at.lat}`);
    this.server?.emit(`driver:${ping.driverId}:location`, ping);
    return { ok: true };
  }
}
