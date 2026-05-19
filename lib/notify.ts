/**
 * Per-category routing: owner email + one WhatsApp Business API number
 * per category. The guest never sees WhatsApp — it is fully backend,
 * fired after payment confirmation.
 *
 * Provider is pluggable (Meta Cloud API / Twilio / MessageBird) behind
 * one interface; without credentials it dry-run logs so the demo and
 * tests work end-to-end. Recommended provider + rationale is in the
 * proposal — the abstraction keeps that choice reversible.
 */
import type { CategoryId } from "./menu";
import { eur } from "./menu";
import type { Order } from "./orders";

function waNumberFor(cat: CategoryId): string {
  const map: Record<CategoryId, string | undefined> = {
    fnb: process.env.WA_NUMBER_FNB,
    adventure: process.env.WA_NUMBER_ADVENTURE,
    taxi: process.env.WA_NUMBER_TAXI,
  };
  return map[cat] ?? "+35600000000";
}

function orderText(o: Order): string {
  const lines = o.lines
    .map((l) => `• ${l.qty}× ${l.name} — ${eur(l.price * l.qty)}`)
    .join("\n");
  return `New order — Room ${o.room} (${o.category.toUpperCase()})\n${lines}\nTotal: ${eur(
    o.total,
  )}\nOrder ${o.id}`;
}

async function sendWhatsApp(to: string, body: string): Promise<{ ok: boolean; via: string }> {
  const provider = (process.env.WHATSAPP_PROVIDER || "").toLowerCase();
  const token = process.env.WHATSAPP_TOKEN;

  if (!provider || !token) {
    console.log(`[whatsapp:dry-run] -> ${to}\n${body}`);
    return { ok: true, via: "dry-run" };
  }

  try {
    if (provider === "meta") {
      const from = process.env.WHATSAPP_FROM; // phone-number-id
      const res = await fetch(`https://graph.facebook.com/v21.0/${from}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      });
      return { ok: res.ok, via: "meta" };
    }
    if (provider === "twilio") {
      const sid = process.env.WHATSAPP_FROM; // account SID:from
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: `whatsapp:${process.env.WHATSAPP_FROM}`,
            To: `whatsapp:${to}`,
            Body: body,
          }),
        },
      );
      return { ok: res.ok, via: "twilio" };
    }
    // messagebird / others: same shape, added on request
    console.log(`[whatsapp:${provider}:unhandled] -> ${to}`);
    return { ok: false, via: provider };
  } catch {
    return { ok: false, via: provider };
  }
}

async function sendOwnerEmail(subject: string, body: string): Promise<{ ok: boolean; via: string }> {
  const to = process.env.OWNER_EMAIL;
  const key = process.env.RESEND_API_KEY;
  if (!to || !key) {
    console.log(`[email:dry-run] -> ${to}\n${subject}\n${body}`);
    return { ok: true, via: "dry-run" };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "orders@suite-qr-order.app",
      to,
      subject,
      text: body,
    }),
  });
  return { ok: res.ok, via: "resend" };
}

export async function notifyOrder(o: Order): Promise<{ email: string; whatsapp: string }> {
  const text = orderText(o);
  const [email, wa] = await Promise.all([
    sendOwnerEmail(`New order — Room ${o.room} (${o.category})`, text),
    sendWhatsApp(waNumberFor(o.category), text),
  ]);
  return { email: email.via, whatsapp: wa.via };
}
