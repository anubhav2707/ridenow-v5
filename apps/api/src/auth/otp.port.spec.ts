import { OTP_PROVIDER } from "./otp.port";

describe("OTP_PROVIDER token", () => {
  it("is a unique Symbol used as the DI token for OTP delivery", () => {
    expect(typeof OTP_PROVIDER).toBe("symbol");
    expect(OTP_PROVIDER.toString()).toBe("Symbol(OTP_PROVIDER)");
  });

  it("is stable across imports so provider and consumer resolve the same token", async () => {
    const again = (await import("./otp.port")).OTP_PROVIDER;
    expect(again).toBe(OTP_PROVIDER);
  });
});
