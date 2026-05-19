import { NextRequest, NextResponse } from "next/server";
import { getOrder, markPaid } from "@/lib/orders";
import { notifyOrder } from "@/lib/notify";
import { isSessionPaid, stripeEnabled } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Finalises an order after the guest returns from checkout. Idempotent:
 * marking an already-paid order is a no-op and notifications fire once.
 * In real Stripe mode the payment is verified server-side against the
 * Checkout Session (the redirect alone is never trusted). The Stripe
 * webhook (/api/webhook/stripe) is the production-authoritative path;
 * this confirm route makes the demo reliable without a webhook secret.
 */
export async function POST(req: NextRequest) {
  const { orderId, sid, sim } = await req.json().catch(() => ({}));
  const order = getOrder(String(orderId || ""));
  if (!order) return NextResponse.json({ error: "unknown order" }, { status: 404 });

  if (order.paid) {
    return NextResponse.json({ status: "already", order: publicOrder(order) });
  }

  if (stripeEnabled() && !sim) {
    if (!sid || !(await isSessionPaid(String(sid)))) {
      return NextResponse.json({ status: "unpaid" }, { status: 402 });
    }
  }
  // sim mode: accept (clearly labeled as simulated in the UI)

  const paid = markPaid(order.id);
  if (!paid) return NextResponse.json({ error: "mark failed" }, { status: 500 });

  const routed = await notifyOrder(paid);
  return NextResponse.json({ status: "ok", order: publicOrder(paid), routed });
}

function publicOrder(o: ReturnType<typeof getOrder>) {
  if (!o) return null;
  return {
    id: o.id,
    room: o.room,
    category: o.category,
    total: o.total,
    lines: o.lines,
  };
}
