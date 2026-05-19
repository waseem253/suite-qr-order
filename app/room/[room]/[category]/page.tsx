import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/menu";
import { isCategoryOrderable, fnbClosedMessage } from "@/lib/hours";
import OrderBuilder from "./OrderBuilder";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ room: string; category: string }>;
}) {
  const { room, category } = await params;
  if (!/^\d{1,4}$/.test(room)) notFound();
  const cat = getCategory(category);
  if (!cat) notFound();

  const orderable = isCategoryOrderable(cat.id);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10 fade">
      <Link
        href={`/room/${room}`}
        className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)]"
      >
        ← Room {room}
      </Link>

      <header className="mb-7 mt-5">
        <h1 className="serif text-4xl font-600">{cat.name}</h1>
        <p className="mt-1.5 text-[14px] text-[var(--muted)]">{cat.blurb}</p>
      </header>

      {!orderable && (
        <div className="mb-7 rounded-xl border border-[var(--line)] bg-[#fbf4e9] px-5 py-4 text-[14px] text-[var(--ink)]">
          {fnbClosedMessage()}
        </div>
      )}

      <OrderBuilder
        room={room}
        category={cat.id}
        items={cat.items}
        orderable={orderable}
      />
    </main>
  );
}
