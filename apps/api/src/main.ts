import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { loadApiConfig } from "./config/env";

async function bootstrap(): Promise<void> {
  const config = loadApiConfig();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors({ origin: true });
  await app.listen(config.port, "0.0.0.0");
  Logger.log(
    `RideNow API listening on http://0.0.0.0:${config.port} ` +
      `(otp=${config.otpProvider}, payment=${config.paymentProvider}, geo=${config.geoProvider})`,
    "Bootstrap",
  );
}

void bootstrap();
