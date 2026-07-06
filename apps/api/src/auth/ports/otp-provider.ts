/**
 * Port for one-time-password delivery. The skeleton binds this to a
 * deterministic console adapter; the real Twilio adapter is deferred to the
 * OTP feature story and swapped in via DI/config with no call-site changes.
 */
export interface OtpProvider {
  readonly name: string;
  sendOtp(phone: string, code: string): Promise<void>;
}

/** DI token for {@link OtpProvider}. */
export const OTP_PROVIDER = Symbol("OTP_PROVIDER");
