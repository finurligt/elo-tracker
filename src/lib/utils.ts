import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(date: Date | number): string {
  const d = typeof date === "number" ? new Date(date * 1000) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatEloChange(delta: number): string {
  return delta > 0 ? `+${delta}` : `${delta}`;
}
