"use client";

import { useMemo, useState } from "react";
import { eur, type MenuItem } from "@/lib/menu";

export default function OrderBuilder({
  room,
  category,
  items,
  orderable,
}: {
  room: string;
  category: string;
  items: MenuItem[];
  orderable: boolean;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      items
        .map((i) => ({ item: i, q: qty[i.id] || 0 }))
        .filter((l) => l.q > 0),
    [qty, items],
  );
  const total = lines.reduce((s, l) => s + l.item.price * l.q, 0);

  function bump(id: string, d: number) {
    setQty((p) => {
      const next = Math.max(0, Math.min(20, (p[id] || 0) + d));
      return { ...p, [id]: next };
    });
  }

  async function pay() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          category,
          lines: lines.map((l) => ({ itemId: l.item.id, qty: l.q })),
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setErr(
            `Please wait ${Math.ceil((j.retryMs || 30000) / 1000)}s — an order was just placed for this room.`,
          );
        } else {
          setErr(j.error || "Could not start checkout.");
        }
        setBusy(false);
        return;
      }
      window.location.href = j.url; // Stripe-hosted or simulated success
    } catch {
      setErr("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <ul className="divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-4 px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="serif text-[19px] font-600">{i.name}</span>
                {i.tag && (
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--gold)]">
                    {i.tag}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[13px] text-[var(--muted)]">{i.desc}</p>
            </div>
            <span className="w-16 text-right text-[14px] tabular-nums">
              {eur(i.price)}
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label="remove one"
                onClick={() => bump(i.id, -1)}
                disabled={!orderable}
                className="h-8 w-8 rounded-full border border-[var(--line)] text-[var(--ink)] disabled:opacity-30"
              >
                −
              </button>
              <span className="w-5 text-center text-[14px] tabular-nums">
                {qty[i.id] || 0}
              </span>
              <button
                aria-label="add one"
                onClick={() => bump(i.id, 1)}
                disabled={!orderable}
                className="h-8 w-8 rounded-full bg-[var(--med)] text-white disabled:opacity-30"
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-0 mt-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[13px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Total
          </span>
          <span className="serif text-2xl font-700 tabular-nums">
            {eur(total)}
          </span>
        </div>
        {err && (
          <p className="mb-3 rounded-lg bg-[#fbeaea] px-3 py-2 text-[13px] text-[#8a2a2a]">
            {err}
          </p>
        )}
        <button
          onClick={pay}
          disabled={!orderable || lines.length === 0 || busy}
          className="w-full rounded-xl bg-[var(--med)] py-3.5 text-[15px] font-600 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!orderable
            ? "Ordering closed"
            : busy
              ? "Opening secure checkout…"
              : "Pay & place order"}
        </button>
        <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
          Secure payment. Your order is sent to our team the moment payment
          succeeds.
        </p>
      </div>
    </div>
  );
}
