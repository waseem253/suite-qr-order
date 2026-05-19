/**
 * Stripe layer.
 *
 * Real Stripe Checkout (TEST mode) when STRIPE_SECRET_KEY is set — the
 * client can drop test card 4242 4242 4242 4242 into a real Stripe-hosted
 * page. When the key is absent the app falls back to a clearly-labeled
 * simulated payment so the public demo never dead-ends. Same order flow,
 * same confirmation, same notifications either way.
 *
 * Stripe is the right call for Malta: full EUR support, SEPA/cards, Malta
 * is in Stripe's supported region, PCI handled by Stripe-hosted Checkout
 * (no card data touches our server). Rationale is in the proposal.
 */
import Stripe from "stripe";
import type { Order } from "./orders";

export function stripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

function client(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY as string);
}

export function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

export async function createCheckout(order: Order): Promise<{ url: string; mode: "stripe" | "simulated" }> {
  const success = `${baseUrl()}/order/success?order=${order.id}&sid={CHECKOUT_SESSION_ID}`;
  const cancel = `${baseUrl()}/room/${order.room}/${order.category}?canceled=1`;

  if (!stripeEnabled()) {
    return { url: `${baseUrl()}/order/success?order=${order.id}&sim=1`, mode: "simulated" };
  }

  const session = await client().checkout.sessions.create({
    mode: "payment",
    success_url: success,
    cancel_url: cancel,
    currency: "eur",
    line_items: order.lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: "eur",
        unit_amount: l.price,
        product_data: { name: l.name },
      },
    })),
    metadata: { orderId: order.id, room: order.room, category: order.category },
  });

  return { url: session.url as string, mode: "stripe" };
}

export async function isSessionPaid(sessionId: string): Promise<boolean> {
  if (!stripeEnabled()) return false;
  try {
    const s = await client().checkout.sessions.retrieve(sessionId);
    return s.payment_status === "paid";
  } catch {
    return false;
  }
}

export function constructEvent(body: string, sig: string): Stripe.Event | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !stripeEnabled()) return null;
  try {
    return client().webhooks.constructEvent(body, sig, secret);
  } catch {
    return null;
  }
}
