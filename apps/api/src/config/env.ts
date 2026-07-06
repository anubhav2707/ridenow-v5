export type ProviderMode = "mock" | "real";

export interface ApiConfig {
  port: number;
  databaseUrl: string;
  otpProvider: ProviderMode;
  paymentProvider: ProviderMode;
  geoProvider: ProviderMode;
}

function mode(value: string | undefined): ProviderMode {
  return value === "real" ? "real" : "mock";
}

/**
 * Read the API configuration from the environment, defaulting every external
 * provider to `mock` so the stack boots and the faked core loop runs with zero
 * secrets. The mock->real swap is a config change, never a code change.
 */
export function loadApiConfig(): ApiConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl:
      process.env.DATABASE_URL ??
      "postgres://ridenow:ridenow@localhost:5432/ridenow",
    otpProvider: mode(process.env.OTP_PROVIDER),
    paymentProvider: mode(process.env.PAYMENT_PROVIDER),
    geoProvider: mode(process.env.GEO_PROVIDER),
  };
}
