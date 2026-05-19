import Link from "next/link";
import { stripeEnabled } from "@/lib/stripe";

export default function Home() {
  const stripe = stripeEnabled();
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
        Demo · guest-facing QR ordering
      </p>
      <h1 className="serif mb-4 text-5xl font-600 leading-tight">
        Scan in the room.
        <br />
        We take care of the rest.
      </h1>
      <p className="mb-8 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        In production each room's QR opens its own page — the guest never
        types a room number. Food &amp; Beverage, Adventure and Taxi, paid
        online, with the order routed to the right team automatically.
      </p>

      <div className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--paper)] p-5">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
          Try a sample room
        </p>
        <div className="flex flex-wrap gap-3">
          {["108", "204", "311"].map((r) => (
            <Link
              key={r}
              href={`/room/${r}`}
              className="rounded-lg bg-[var(--med)] px-5 py-2.5 text-sm font-600 text-white"
            >
              Open Room {r}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-[var(--muted)]">
        Payments:{" "}
        <strong className="text-[var(--ink)]">
          {stripe ? "live Stripe test mode" : "simulated (label shown at checkout)"}
        </strong>
        . {stripe ? "Use test card 4242 4242 4242 4242, any future date/CVC." : "Add Stripe test keys to switch to a real card-entry page."}
      </p>
    </main>
  );
}
