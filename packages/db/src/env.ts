import { config } from "dotenv";

/** Load a repo-root .env if present. Safe to call multiple times. */
export function loadEnv(): void {
  config();
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env");
  }
  return url;
}

/** Hosts we consider "local" and therefore safe to drop/reset. */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0", "db", "postgres"]);

/**
 * Guard rail for destructive operations: refuse to run against anything that
 * isn't an obviously-local database. Protects the reset script from ever being
 * pointed at a shared/staging/prod URL.
 */
export function assertLocalDatabase(url: string): void {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error(`DATABASE_URL is not a valid URL: ${url}`);
  }
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `refusing to run a destructive operation against non-local host "${host}". ` +
        `Allowed: ${[...LOCAL_HOSTS].join(", ")}`,
    );
  }
}
