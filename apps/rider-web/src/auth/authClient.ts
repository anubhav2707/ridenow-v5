/**
 * Client for the phone-OTP auth endpoints. The UI depends only on this
 * interface, so tests inject a deterministic fake and the real app talks to the
 * NestJS API.
 */
export interface AuthClient {
  requestOtp(phone: string): Promise<{ sent: boolean }>;
  verifyOtp(phone: string, code: string): Promise<{ token: string }>;
}

const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export class HttpAuthClient implements AuthClient {
  constructor(private readonly baseUrl: string = DEFAULT_BASE_URL) {}

  async requestOtp(phone: string): Promise<{ sent: boolean }> {
    const res = await fetch(`${this.baseUrl}/auth/request-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      throw new Error("could not send verification code");
    }
    return (await res.json()) as { sent: boolean };
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string }> {
    const res = await fetch(`${this.baseUrl}/auth/verify-otp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    if (!res.ok) {
      throw new Error("incorrect verification code");
    }
    return (await res.json()) as { token: string };
  }
}

export const httpAuthClient = new HttpAuthClient();
