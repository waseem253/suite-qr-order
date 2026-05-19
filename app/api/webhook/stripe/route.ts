import { NextRequest, NextResponse } from "next/server";
import { constructEvent } from "@/lib/stripe";
import { getOrder, markPaid } from "@/lib/orders";
import { notifyOrder } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * Production-authoritative payment confirmation. Stripe POSTs
 * `checkout.session.completed` here with a signed payload; we verify the
 * signature, then mark paid + notify exactly once. This is the path that
 * survives the guest closing the tab before the redirect — the brief's
 * "automated email/WhatsApp for every order" must not depend on the
 * browser coming back.
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") || "";
  const raw = await req.text();
  const event = constructEvent(raw, sig);
  if (!event) return NextResponse.json({ error: "bad signature" }, { status: 400 });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;
    const order = orderId ? getOrder(orderId) : null;
    if (order && !order.paid) {
      const paid = markPaid(order.id);
      if (paid) await notifyOrder(paid);
    }
  }
  return NextResponse.json({ received: true });
}
