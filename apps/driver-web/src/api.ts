export interface MoneyJson {
  amount: number;
  currency: string;
}

export interface CoreLoop {
  transitions: string[];
  quote: {
    total: MoneyJson;
    distanceMeters: number;
    durationSeconds: number;
  };
  ledgerEntry: {
    gross: MoneyJson;
    commission: MoneyJson;
    netTakeHome: MoneyJson;
    commissionBps: number;
  };
}

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3000";

export async function fetchCoreLoop(): Promise<CoreLoop> {
  const res = await fetch(`${API_URL}/loop/run`);
  if (!res.ok) {
    throw new Error(`API responded ${res.status}`);
  }
  return (await res.json()) as CoreLoop;
}

export function formatMoney(m: MoneyJson): string {
  return `${m.currency} ${(m.amount / 100).toFixed(2)}`;
}
