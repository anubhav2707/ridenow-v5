import { AuthService } from "./auth.service";
import type { OtpProvider } from "./ports/otp-provider";

describe("AuthService", () => {
  function make() {
    const sent: Array<{ phone: string; code: string }> = [];
    const otp: OtpProvider = {
      name: "test",
      async sendOtp(phone, code) {
        sent.push({ phone, code });
      },
    };
    return { service: new AuthService(otp), sent };
  }

  it("issues a session token ONLY after the correct OTP is submitted", async () => {
    const { service, sent } = make();
    const phone = "+15551230001";

    const requested = await service.requestOtp(phone);
    expect(requested.sent).toBe(true);
    expect(sent).toHaveLength(1);

    const delivered = sent[0];
    expect(delivered).toBeDefined();
    const code = delivered!.code;
    expect(code).toMatch(/^\d{6}$/);

    // Wrong code grants no session.
    const wrong = code === "000000" ? "111111" : "000000";
    await expect(service.verifyOtp(phone, wrong)).rejects.toThrow();

    // Correct code grants an authenticated session.
    const verified = await service.verifyOtp(phone, code);
    expect(verified.token).toMatch(/^sess_/);
    expect(service.isAuthenticated(verified.token)).toBe(true);
  });

  it("rejects verification for a phone that never requested a code", async () => {
    const { service } = make();
    await expect(service.verifyOtp("+19998887777", "123456")).rejects.toThrow();
  });

  it("consumes the code so it cannot be replayed", async () => {
    const { service, sent } = make();
    const phone = "+15551230002";
    await service.requestOtp(phone);
    const code = sent[0]!.code;

    await service.verifyOtp(phone, code);
    await expect(service.verifyOtp(phone, code)).rejects.toThrow();
  });
});
