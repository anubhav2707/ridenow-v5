import { Injectable } from "@nestjs/common";

export type ProviderMode = string;

/** Typed view over the environment. The only place env vars are read. */
@Injectable()
export class AppConfig {
  readonly port = Number(process.env.PORT ?? 3000);
  readonly databaseUrl =
    process.env.DATABASE_URL ?? "postgres://ridenow:ridenow@localhost:5432/ridenow";
  readonly otpProvider: ProviderMode = process.env.OTP_PROVIDER ?? "mock";
  readonly paymentProvider: ProviderMode = process.env.PAYMENT_PROVIDER ?? "mock";
  readonly geoProvider: ProviderMode = process.env.GEO_PROVIDER ?? "mock";
  readonly commissionBps = Number(process.env.COMMISSION_BPS ?? 2000);
}
