import type { ChipProps } from "@mui/material";

/** Display helpers shared by the order, purchase and approval screens. */
export function formatMoney(value: string | number | null | undefined, currency = "INR"): string {
  const amount = typeof value === "number" ? value : Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : undefined, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  } catch { return `${amount.toFixed(2)} ${currency}`; }
}

/** `SO-e63735b3-…-f880fc789fc4` → `SO-FC789FC4` (last 8 hex digits); other numbers are shown as-is. */
export function shortNumber(number: string): string {
  const match = /^([A-Z]{2,4})-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}([0-9a-f]{8})$/i.exec(number);
  return match ? `${match[1].toUpperCase()}-${match[2].toUpperCase()}` : number;
}

export const statusLabel = (status: string) => status.replaceAll("_", " ").replace(/^\w/, char => char.toUpperCase());
export function statusColor(status: string): ChipProps["color"] {
  if (["fulfilled", "received", "posted", "completed"].includes(status)) return "success";
  if (["approved", "partially_fulfilled", "partially_received"].includes(status)) return "info";
  if (["pending"].includes(status)) return "warning";
  if (["rejected", "cancelled", "reversed"].includes(status)) return "error";
  return "default";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";
}
