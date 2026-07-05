import { Test } from "@nestjs/testing";
import { HAPPY_PATH } from "@ridenow/shared-types";
import { ConfigModule } from "../src/config/config.module";
import { RidesModule } from "../src/rides/rides.module";
import { RidesService } from "../src/rides/rides.service";
import { EarningsService } from "../src/earnings/earnings.service";

/**
 * The faked core loop end-to-end over the mock adapters: real state-machine
 * transitions, canned geo/earnings. Proves the vertical slice wires up before
 * any feature logic exists.
 */
describe("faked core loop (e2e)", () => {
  it("drives new -> completed and writes a driver earnings entry", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule, RidesModule],
    }).compile();

    const rides = moduleRef.get(RidesService, { strict: false });
    const earnings = moduleRef.get(EarningsService, { strict: false });

    const quoted = await rides.quote(
      { lng: -122.4194, lat: 37.7749 },
      { lng: -122.4094, lat: 37.7849 },
    );
    expect(quoted.state).toBe("quoted");
    expect(quoted.quote?.total.amount).toBeGreaterThan(0);

    rides.book(quoted.rideId);
    const accepted = rides.accept(quoted.rideId);
    expect(accepted.state).toBe("accepted");
    expect(accepted.driverId).toBeTruthy();

    const started = rides.start(quoted.rideId, accepted.startOtp);
    expect(started.state).toBe("started");

    const completed = rides.complete(quoted.rideId);
    expect(completed.state).toBe("completed");
    expect(completed.history).toEqual([...HAPPY_PATH]);

    const driverId = accepted.driverId;
    expect(driverId).not.toBeNull();
    const ledger = earnings.getLedger(driverId as string);
    expect(ledger).toHaveLength(1);

    const entry = ledger[0];
    expect(entry).toBeDefined();
    expect(entry!.netTakeHome.amount).toBeGreaterThan(0);
    expect(entry!.commission.amount + entry!.netTakeHome.amount).toBe(completed.quote?.total.amount);

    await moduleRef.close();
  });
});
