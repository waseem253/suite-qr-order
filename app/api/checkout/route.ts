import { NextRequest, NextResponse } from "next/server";
import { getCategory, type CategoryId } from "@/lib/menu";
import { isCategoryOrderable } from "@/lib/hours";
import { canOrder, cooldownRemaining, createOrder, type OrderLine } from "@/lib/orders";
import { createCheckout } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad body" }, { status: 400 });

  const room = String(body.room || "").trim();
  const categoryId = String(body.category || "") as CategoryId;
  const category = getCategory(categoryId);

  if (!/^\d{1,4}$/.test(room)) {
    return NextResponse.json({ error: "invalid room" }, { status: 422 });
  }
  if (!category) {
    return NextResponse.json({ error: "unknown category" }, { status: 422 });
  }
  if (!isCategoryOrderable(category.id)) {
    return NextResponse.json(
      { error: "Ordering is closed for this category right now." },
      { status: 409 },
    );
  }
  if (!canOrder(room)) {
    return NextResponse.json(
      { error: "cooldown", retryMs: cooldownRemaining(room) },
      { status: 429 },
    );
  }

  const itemsById = new Map(category.items.map((i) => [i.id, i]));
  const lines: OrderLine[] = [];
  for (const raw of body.lines ?? []) {
    const item = itemsById.get(String(raw.itemId));
    const qty = Math.max(1, Math.min(20, parseInt(raw.qty, 10) || 0));
    if (item) lines.push({ itemId: item.id, name: item.name, qty, price: item.price });
  }
  if (lines.length === 0) {
    return NextResponse.json({ error: "empty order" }, { status: 422 });
  }

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const order = createOrder({ room, category: category.id, lines, total });

  try {
    const { url, mode } = await createCheckout(order);
    return NextResponse.json({ url, mode, orderId: order.id });
  } catch (e) {
    return NextResponse.json(
      { error: "checkout failed", detail: e instanceof Error ? e.message : "unknown" },
      { status: 502 },
    );
  }
}
