import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupFlow } from "./SignupFlow";
import type { AuthClient } from "./authClient";

const CORRECT_CODE = "424242";

function fakeAuthClient(): AuthClient {
  return {
    requestOtp: vi.fn(async () => ({ sent: true })),
    verifyOtp: vi.fn(async (_phone: string, code: string) => {
      if (code !== CORRECT_CODE) {
        throw new Error("incorrect code");
      }
      return { token: "sess_test_123" };
    }),
  };
}

describe("SignupFlow", () => {
  it("goes phone -> OTP and grants a session only on the correct code", async () => {
    const user = userEvent.setup();
    const client = fakeAuthClient();
    const onAuthenticated = vi.fn();
    render(<SignupFlow authClient={client} onAuthenticated={onAuthenticated} />);

    // Starts on the phone screen (no session yet).
    await user.type(screen.getByLabelText(/phone number/i), "+15551230001");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    // Transitions to the OTP entry screen.
    expect(
      await screen.findByLabelText(/verification code/i),
    ).toBeInTheDocument();
    expect(client.requestOtp).toHaveBeenCalledWith("+15551230001");
    expect(onAuthenticated).not.toHaveBeenCalled();

    // Wrong code => stays on OTP screen, no session granted.
    await user.type(screen.getByLabelText(/verification code/i), "000000");
    await user.click(screen.getByRole("button", { name: /verify/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrect/i);
    expect(onAuthenticated).not.toHaveBeenCalled();
    expect(screen.queryByText(/signed in/i)).not.toBeInTheDocument();

    // Correct code => authenticated session.
    const codeInput = screen.getByLabelText(/verification code/i);
    await user.clear(codeInput);
    await user.type(codeInput, CORRECT_CODE);
    await user.click(screen.getByRole("button", { name: /verify/i }));

    expect(await screen.findByText(/signed in/i)).toBeInTheDocument();
    expect(onAuthenticated).toHaveBeenCalledWith("sess_test_123");
  });
});
