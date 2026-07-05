import { Injectable } from "@nestjs/common";
import type { LngLat } from "@ridenow/shared-types";

export interface Driver {
  id: string;
  displayName: string;
  kycStatus: "pending" | "approved" | "rejected";
}

/**
 * Driver roster + assignment, faked in memory. Mirrors the seeded drivers.
 * The real nearest-driver query (PostGIS KNN over drivers.last_location) lands
 * in the geo/matching story; the schema + GiST index are already in place.
 */
@Injectable()
export class DriversService {
  private readonly drivers: Driver[] = [
    { id: "drv_ada", displayName: "Ada Driver", kycStatus: "approved" },
    { id: "drv_grace", displayName: "Grace Driver", kycStatus: "approved" },
  ];

  listDrivers(): readonly Driver[] {
    return this.drivers;
  }

  /** Mock matcher — returns the first KYC-approved driver. */
  assignNearest(_pickup: LngLat): Driver {
    const driver = this.drivers.find((d) => d.kycStatus === "approved");
    if (!driver) {
      throw new Error("no KYC-approved driver available");
    }
    return driver;
  }
}
