export interface OtpChallenge {
  phone: string;
  code: string;
}

/**
 * Port for sending a phone OTP. The scaffold ships a console adapter (also the
 * dev behaviour of the real one); a later story swaps in Twilio Verify.
 */
export interface OtpProvider {
  send(phone: string): Promise<OtpChallenge>;
}

export const OTP_PROVIDER = Symbol("OTP_PROVIDER");
