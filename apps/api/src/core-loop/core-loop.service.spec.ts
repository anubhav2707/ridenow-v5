import { CoreLoopService } from "./core-loop.service";
import { RidesService } from "../rides/rides.service";
import { GeoService } from "../geo/geo.service";
import { StubGeoProvider } from "../geo/adapters/stub-geo.provider";
import { PaymentsService } from "../payments/payments.service";
import { FakePaymentProvider } from "../payments/adapters/fake-payment.provider";
import { DriversService } from "../drivers/drivers.service";
import { EarningsService } from "../earnings/earnings.service";

describe("CoreLoopService (faked vertical slice)", () => {
  function make() {
    return new CoreLoopService(
      new RidesService(),
      new GeoService(new StubGeoProvider()),
      new PaymentsService(new FakePaymentProvider()),
      new DriversService(),
      new EarningsService(),
    );
  }

  it("drives the ordered trip-state happy path to completion", async () => {
    const result = await make().run();
    expect(result.transitions).toEqual([
      "new",
      "requested",
      "quoted",
      "booked",
      "accepted",
      "started",
      "completed",
    ]);
  });

  it("records an earnings ledger entry that reconciles to the quoted fare", async () => {
    const { quote, ledgerEntry } = await make().run();
    expect(ledgerEntry.gross.amount).toBe(quote.total.amount);
    expect(
      ledgerEntry.commission.amount + ledgerEntry.netTakeHome.amount,
    ).toBe(quote.total.amount);
  });
});
