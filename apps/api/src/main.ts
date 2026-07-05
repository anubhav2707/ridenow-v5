import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableCors();
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
  new Logger("bootstrap").log(`RideNow API listening on http://0.0.0.0:${port}`);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("failed to bootstrap RideNow API", error);
  process.exit(1);
});
