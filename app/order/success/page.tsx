import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
          <p className="text-[var(--muted)]">Confirming your order…</p>
        </main>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
