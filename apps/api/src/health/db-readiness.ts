import { Injectable } from "@nestjs/common";
import type { PostgisReadiness } from "@ridenow/db";
import { AppConfig } from "../config/app-config";

/**
 * Wraps the @ridenow/db PostGIS probe. The db client is imported lazily so unit
 * tests can override this provider without ever loading the postgres driver.
 */
@Injectable()
export class DbReadiness {
  constructor(private readonly cfg: AppConfig) {}

  async check(): Promise<PostgisReadiness> {
    const { createSql, pingPostgis } = await import("@ridenow/db");
    const sql = createSql(this.cfg.databaseUrl);
    try {
      return await pingPostgis(sql);
    } finally {
      await sql.end();
    }
  }
}
