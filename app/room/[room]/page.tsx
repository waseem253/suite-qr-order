import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_ORDER, CATEGORIES } from "@/lib/menu";
import { isCategoryOrderable } from "@/lib/hours";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  if (!/^\d{1,4}$/.test(room)) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-14 fade">
      <header className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          In-Room Service
        </p>
        <h1 className="serif mt-3 text-5xl font-600">Room {room}</h1>
        <p className="mt-3 text-[15px] text-[var(--muted)]">
          How may we look after you?
        </p>
      </header>

      <div className="space-y-4">
        {CATEGORY_ORDER.map((id) => {
          const c = CATEGORIES[id];
          const open = isCategoryOrderable(id);
          return (
            <Link
              key={id}
              href={`/room/${room}/${id}`}
              className="block rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 transition-colors hover:border-[var(--med)]"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="serif text-2xl font-600">{c.name}</h2>
                <span
                  className="text-[11px] uppercase tracking-[0.16em]"
                  style={{ color: open ? "var(--med)" : "var(--muted)" }}
                >
                  {c.always ? "24 hours" : open ? "Open now" : "View menu"}
                </span>
              </div>
              <p className="mt-1.5 text-[14px] text-[var(--muted)]">{c.blurb}</p>
            </Link>
          );
        })}
      </div>

      <p className="mt-12 text-center text-[12px] text-[var(--muted)]">
        Charges appear on your card. A confirmation is shown on screen.
      </p>
    </main>
  );
}
