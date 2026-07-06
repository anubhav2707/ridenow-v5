import { ConsoleOtpProvider } from "../auth/console-otp.provider";
import { StubGeoProvider } from "../geo/stub-geo.provider";
import { FakePaymentProvider } from "../payments/fake-payment.provider";
import { CoreLoopService } from "./core-loop.service";
import type {
  CoreLoopStore,
  CreateRideInput,
  RecordEarningsInput,
  StoredLedgerEntry,
} from "./core-loop.store";

/** In-memory CoreLoopStore that records the calls the service makes. */
class FakeStore implements CoreLoopStore {
  readonly stateWrites: { state: string; fare?: number }[] = [];
  assigned: string | null = null;
  earnings: RecordEarningsInput | null = null;

  pickOnlineDriver(): Promise<string> {
    return Promise.resolve("driver-1");
  }
  createRide(_input: CreateRideInput): Promise<{ id: string }> {
    return Promise.resolve({ id: "ride-1" });
  }
  setRideState(_rideId: string, state: string, fareTotalMinor?: number): Promise<void> {
    this.stateWrites.push(
      fareTotalMinor === undefined ? { state } : { state, fare: fareTotalMinor },
    );
    return Promise.resolve();
  }
  assignDriver(_rideId: string, driverId: string): Promise<void> {
    this.assigned = driverId;
    return Promise.resolve();
  }
  recordEarnings(input: RecordEarningsInput): Promise<StoredLedgerEntry> {
    this.earnings = input;
    return Promise.resolve({
      entryId: "ledger-1",
      driverId: input.driverId,
      rideId: input.rideId,
      gross: input.gross,
      commission: input.commission,
      netTakeHome: input.netTakeHome,
      commissionBps: input.commissionBps,
      createdAt: "2026-07-06T00:00:00.000Z",
    });
  }
}

describe("CoreLoopService", () => {
  it("drives the ordered happy path and records a consistent ledger entry", async () => {
    const store = new FakeStore();
    const service = new CoreLoopService(
      new StubGeoProvider(),
      new FakePaymentProvider(),
      new ConsoleOtpProvider(),
      store,
    );

    const result = await service.run();

    expect(result.states).toEqual([
      "new",
      "requested",
      "quoted",
      "booked",
      "accepted",
      "started",
      "completed",
    ]);
    expect(result.transitions.map((t) => t.to)).toEqual([
      "requested",
      "quoted",
      "booked",
      "accepted",
      "started",
      "completed",
    ]);

    // the QUOTE transition persists the fare total
    expect(store.stateWrites.find((w) => w.state === "quoted")?.fare).toBe(result.quote.total.amount);
    expect(store.assigned).toBe("driver-1");

    // ledger: commission + take-home sum back to gross with no drift
    const { gross, commission, netTakeHome } = result.ledgerEntry;
    expect(commission.amount + netTakeHome.amount).toBe(gross.amount);
    expect(gross.amount).toBe(result.quote.total.amount);
    expect(result.payment.status).toBe("succeeded");
  });
});
