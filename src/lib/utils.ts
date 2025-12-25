import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) {
    return "";
  }
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}

export function formatCurrencyCompact(amount?: number | null) {
  if (amount === null || amount === undefined) {
    return "";
  }
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    compactDisplay: "short",
  });
}
