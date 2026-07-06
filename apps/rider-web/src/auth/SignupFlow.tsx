import { useState, type FormEvent } from "react";
import { httpAuthClient, type AuthClient } from "./authClient";

type Step = "phone" | "otp" | "authed";

export interface SignupFlowProps {
  authClient?: AuthClient;
  onAuthenticated?: (token: string) => void;
}

/**
 * Phone-OTP signup. With no existing session the rider enters a phone number;
 * submitting it transitions to the OTP screen. A session is granted ONLY after
 * the correct code is verified.
 */
export function SignupFlow({
  authClient = httpAuthClient,
  onAuthenticated,
}: SignupFlowProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitPhone(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await authClient.requestOtp(phone);
      setCode("");
      setStep("otp");
    } catch {
      setError("Could not send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await authClient.verifyOtp(phone, code);
      setToken(result.token);
      setStep("authed");
      onAuthenticated?.(result.token);
    } catch {
      setError("Incorrect code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "authed") {
    return (
      <section aria-label="signed-in">
        <h1>You&apos;re signed in</h1>
        <p role="status">Session active</p>
        {token ? <code>{token.slice(0, 12)}…</code> : null}
      </section>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={submitCode} aria-label="otp-form">
        <h1>Enter the code</h1>
        <p>We sent a 6-digit code to {phone}.</p>
        <label htmlFor="code">Verification code</label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" disabled={busy}>
          Verify
        </button>
        {error ? <p role="alert">{error}</p> : null}
      </form>
    );
  }

  return (
    <form onSubmit={submitPhone} aria-label="phone-form">
      <h1>Sign up</h1>
      <label htmlFor="phone">Phone number</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+1 555 123 0001"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button type="submit" disabled={busy}>
        Send code
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
