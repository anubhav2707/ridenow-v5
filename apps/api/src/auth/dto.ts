import { z } from "zod";

/** A plausible E.164-ish phone number. */
const phone = z.string().regex(/^\+?[1-9]\d{6,14}$/, "invalid phone number");

export const RequestOtpSchema = z.object({ phone });
export type RequestOtpDto = z.infer<typeof RequestOtpSchema>;

export const VerifyOtpSchema = z.object({
  phone,
  code: z.string().regex(/^\d{6}$/, "code must be 6 digits"),
});
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
