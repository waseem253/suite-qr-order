/**
 * Service-hours logic.
 *
 * F&B: 10:00–04:00 (a window that crosses midnight — the common bug is
 * treating it as 10:00–04:00 same-day; this handles the wrap). Outside
 * the window the menu stays fully browseable, only ordering is blocked
 * with a polite closed message, exactly as the brief requires.
 *
 * Adventure & Taxi: always open.
 *
 * Malta is Europe/Malta (CET/CEST). We compute the local hour explicitly
 * so it is correct regardless of where the server runs.
 */
import type { CategoryId } from "./menu";

const FNB_OPEN = 10; // 10:00
const FNB_CLOSE = 4; // 04:00 next day

export function maltaHour(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Malta",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = parts.find((p) => p.type === "hour")?.value ?? "0";
  return parseInt(h, 10) % 24;
}

export function isFnbOpen(now: Date = new Date()): boolean {
  const h = maltaHour(now);
  // Window wraps midnight: open if h >= 10 OR h < 4.
  return h >= FNB_OPEN || h < FNB_CLOSE;
}

export function isCategoryOrderable(cat: CategoryId, now: Date = new Date()): boolean {
  if (cat === "fnb") return isFnbOpen(now);
  return true; // adventure, taxi: 24/7
}

export function fnbClosedMessage(): string {
  return "In-room dining is served from 10:00 to 04:00. You're welcome to browse the menu — ordering reopens at 10:00.";
}
