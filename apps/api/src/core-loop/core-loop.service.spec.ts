import { Test } from "@nestjs/testing";
import { HAPPY_PATH, money } from "@ridenow/shared-types";
import { CoreLoopService } from "./core-loop.service";
import { GEO_PROVIDER, OTP_PROVIDER, PAYMENT_PROVIDER } from "../providers/ports";
import { MockOtpProvider } from "../providers/mock-otp.provider";
import { MockPaymentProvider } from "../providers/mock-payment.provider";
import { MockGeoProvider } from "../providers/mock-geo.provider";

describe("CoreLoopService (faked core loop)", () => {
  it("drives the ordered happy path and produces a consistent earnings ledger entry", async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CoreLoopService,
        { provide: OTP_PROVIDER, useClass: MockOtpProvider },
        { provide: PAYMENT_PROVIDER, useClass: MockPaymentProvider },
        { provide: GEO_PROVIDER, useClass: MockGeoProvider },
      ],
    }).compile();

    const service = moduleRef.get(CoreLoopService);
    const result = await service.run();

    expect(result.transitions).toEqual([...HAPPY_PATH]);
    expect(result.payment.status).toBe("succeeded");

    // gross = commission + net, with no rounding drift.
    const { gross, commission, netTakeHome } = result.ledgerEntry;
    expect(commission.amount + netTakeHome.amount).toBe(gross.amount);
    expect(gross).toEqual(result.quote.total);
    expect(gross.amount).toBeGreaterThan(0);
    expect(Number.isInteger(gross.amount)).toBe(true);
    expect(commission).toEqual(money(Math.round((gross.amount * 2000) / 10000), "USD"));
  });
});
