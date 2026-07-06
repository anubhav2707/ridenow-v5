import type { LngLat, Money, RouteEstimate } from "@ridenow/shared-types";

/**
 * Ports-and-adapters boundaries for every external dependency. Each has an
 * injection token, an interface, and a deterministic MOCK adapter as the default.
 * Swapping to a real adapter is a DI/config change in a later story — not a
 * refactor — which is what lets the faked core loop run with zero secrets.
 */

export const OTP_PROVIDER = Symbol("OTP_PROVIDER");
export interface OtpPort {
  /** Send an OTP. In dev the code is returned/logged (never a real SMS). */
  sendOtp(phone: string): Promise<{ sentTo: string; devCode: string }>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

export const PAYMENT_PROVIDER = Symbol("PAYMENT_PROVIDER");
export interface PaymentResult {
  paymentId: string;
  status: "succeeded";
  amount: Money;
}
export interface PaymentPort {
  charge(amount: Money, reference: string): Promise<PaymentResult>;
}

export const GEO_PROVIDER = Symbol("GEO_PROVIDER");
export interface GeoPort {
  estimateRoute(pickup: LngLat, dropoff: LngLat): Promise<RouteEstimate>;
}
