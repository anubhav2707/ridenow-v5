/** DI token for the OTP delivery port. */
export const OTP_PROVIDER = Symbol("OTP_PROVIDER");

/**
 * Port for one-time-password delivery. The mock adapter logs the code; the real
 * Twilio adapter is deferred (a DI swap gated on TWILIO_* secrets).
 */
export interface OtpProvider {
  sendOtp(phone: string, code: string): Promise<void>;
}
