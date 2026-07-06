import { Logger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ConsoleOtpProvider } from "./console-otp.provider";
import type { OtpProvider } from "./otp.port";

describe("ConsoleOtpProvider", () => {
  let provider: ConsoleOtpProvider;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Silence + capture the Logger the provider writes to.
    logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [ConsoleOtpProvider],
    }).compile();

    provider = moduleRef.get(ConsoleOtpProvider);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("satisfies the OtpProvider port contract", () => {
    // Structural check: the adapter must remain assignable to the port so the
    // real Twilio adapter can swap in behind OTP_PROVIDER.
    const asPort: OtpProvider = provider;
    expect(typeof asPort.sendOtp).toBe("function");
  });

  describe("sendOtp", () => {
    it("happy path: 'delivers' the code by logging both phone and code, and resolves", async () => {
      await expect(provider.sendOtp("+15551234567", "482913")).resolves.toBeUndefined();

      expect(logSpy).toHaveBeenCalledTimes(1);
      const message = logSpy.mock.calls[0][0] as string;
      expect(message).toContain("+15551234567");
      expect(message).toContain("482913");
    });

    it("never sends a real SMS — the log marks it as a dev mock", async () => {
      await provider.sendOtp("+15551234567", "000000");

      const message = logSpy.mock.calls[0][0] as string;
      expect(message.toLowerCase()).toContain("mock");
      expect(message).toMatch(/no sms sent/i);
    });

    it("edge case: does not drop leading zeros or misplace an empty phone", async () => {
      // A code with leading zeros is the value most likely to be mangled by
      // naive number handling; assert it is logged verbatim as a string.
      await provider.sendOtp("", "007");

      const message = logSpy.mock.calls[0][0] as string;
      expect(message).toContain("is 007 ");
    });

    it("error path: resolves (never rejects) even for degenerate input", async () => {
      // The mock adapter has no failure mode — delivery must always succeed so
      // it never blocks the auth flow in dev.
      await expect(
        provider.sendOtp(undefined as unknown as string, undefined as unknown as string),
      ).resolves.toBeUndefined();
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });
});
