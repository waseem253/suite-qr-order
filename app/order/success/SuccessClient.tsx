"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { eur } from "@/lib/menu";

const COOLDOWN = 30;

interface ConfirmedOrder {
  id: string;
  room: string;
  category: string;
  total: number;
  lines: { name: string; qty: number; price: number }[];
}

export default function SuccessClient() {
  const sp = useSearchParams();
  const orderId = sp.get("order");
  const sid = sp.get("sid");
  const sim = sp.get("sim");

  const [state, setState] = useState<"loading" | "ok" | "unpaid" | "error">("loading");
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [left, setLeft] = useState(COOLDOWN);
  const once = useRef(false);

  useEffect(() => {
    if (once.current || !orderId) return;
    once.current = true;
    fetch("/api/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, sid, sim }),
    })
      .then(async (r) => {
        const j = await r.json();
        if (r.ok && (j.status === "ok" || j.status === "already")) {
          setOrder(j.order);
          setState("ok");
        } else if (j.status === "unpaid") {
          setState("unpaid");
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, [orderId, sid, sim]);

  useEffect(() => {
    if (state !== "ok") return;
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [state]);

  if (state === "loading")
    return <Centered>Confirming your order…</Centered>;
  if (state === "unpaid")
    return <Centered>Payment was not completed. You can return to your room and try again.</Centered>;
  if (state === "error" || !order)
    return <Centered>We couldn&apos;t confirm this order. Please contact the front desk.</Centered>;

  const blocked = left > 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 fade">
      <div className="mb-6 flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--med)] text-white">
          ✓
        </span>
      </div>
      <h1 className="serif text-center text-4xl font-600">Order confirmed</h1>
      <p className="mt-3 text-center text-[15px] text-[var(--muted)]">
        Thank you. Our team has been notified and will be in touch shortly.
      </p>

      {sim && (
        <p className="mt-4 rounded-lg bg-[#fbf4e9] px-3 py-2 text-center text-[12px] text-[var(--muted)]">
          Demo: simulated payment (no Stripe key configured). The full order
          + routing flow ran exactly as in production.
        </p>
      )}

      <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex justify-between text-[13px] text-[var(--muted)]">
          <span>Room {order.room}</span>
          <span className="uppercase tracking-[0.14em]">{order.category}</span>
        </div>
        <ul className="mt-3 space-y-1.5">
          {order.lines.map((l, i) => (
            <li key={i} className="flex justify-between text-[14px]">
              <span>
                {l.qty}× {l.name}
              </span>
              <span className="tabular-nums">{eur(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-[var(--line)] pt-3">
          <span className="text-[13px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Total
          </span>
          <span className="serif text-xl font-700 tabular-nums">
            {eur(order.total)}
          </span>
        </div>
      </div>

      <Link
        href={blocked ? "#" : `/room/${order.room}`}
        aria-disabled={blocked}
        className={`mt-6 block rounded-xl py-3.5 text-center text-[15px] font-600 ${
          blocked
            ? "pointer-events-none border border-[var(--line)] text-[var(--muted)]"
            : "bg-[var(--med)] text-white"
        }`}
      >
        {blocked
          ? `You can place another order in ${left}s`
          : "Place another order"}
      </Link>
      <p className="mt-3 text-center text-[11px] text-[var(--muted)]">
        A short pause after each order prevents accidental double-taps.
      </p>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6 text-center text-[15px] text-[var(--muted)] fade">
      {children}
    </main>
  );
}
