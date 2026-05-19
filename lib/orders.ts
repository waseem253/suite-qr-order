/**
 * Order state + the 30-second double-tap block.
 *
 * After an order is placed for a room, that room cannot place another
 * for 30s. Enforced server-side (a client timer alone is trivially
 * bypassed by re-scanning the QR). In-memory for the demo; production
 * uses the same interface backed by Postgres/Redis (one-line swap).
 */
import type { CategoryId } from "./menu";

export interface OrderLine {
  itemId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  room: string;
  category: CategoryId;
  lines: OrderLine[];
  total: number;
  createdAt: number;
  paid: boolean;
}

const COOLDOWN_MS = 30_000;

const orders = new Map<string, Order>();
const lastOrderAt = new Map<string, number>(); // room -> ts

export function cooldownRemaining(room: string, now = Date.now()): number {
  const last = lastOrderAt.get(room);
  if (!last) return 0;
  return Math.max(0, COOLDOWN_MS - (now - last));
}

export function canOrder(room: string): boolean {
  return cooldownRemaining(room) === 0;
}

export function createOrder(o: Omit<Order, "id" | "createdAt" | "paid">): Order {
  const id = "ord_" + Math.random().toString(36).slice(2, 10);
  const order: Order = { ...o, id, createdAt: Date.now(), paid: false };
  orders.set(id, order);
  return order;
}

export function markPaid(id: string): Order | null {
  const o = orders.get(id);
  if (!o) return null;
  o.paid = true;
  lastOrderAt.set(o.room, Date.now()); // start the 30s block on payment
  orders.set(id, o);
  return o;
}

export function getOrder(id: string): Order | null {
  return orders.get(id) ?? null;
}

export const COOLDOWN_SECONDS = COOLDOWN_MS / 1000;
