import { useState } from "react";
import { SignupFlow } from "./auth/SignupFlow";
import { MapView } from "./MapView";

const SESSION_KEY = "ridenow.session";

export default function App() {
  const [session, setSession] = useState<string | null>(() =>
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem(SESSION_KEY),
  );

  function handleAuthenticated(token: string) {
    localStorage.setItem(SESSION_KEY, token);
    setSession(token);
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  if (!session) {
    return (
      <main style={{ maxWidth: 420, margin: "3rem auto", fontFamily: "system-ui" }}>
        <SignupFlow onAuthenticated={handleAuthenticated} />
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
        <strong>RideNow</strong>
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      </header>
      <MapView />
      <p style={{ padding: "1rem" }}>Ready to request a ride.</p>
    </main>
  );
}
