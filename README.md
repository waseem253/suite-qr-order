# Suite QR Order — guest-facing in-room ordering

> Scan the room QR → premium page → order Food & Beverage / Adventure / Taxi → pay online → on-screen confirmation. Every order is emailed to the owner and routed by category to one of three WhatsApp Business API numbers, fully backend.

**Live demo:** _deployed on Vercel_ · **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Stripe Checkout · Vercel

Built against the brief for an 86-room Maltese hotel.

## Brief → implementation

| Requirement | Where |
|---|---|
| Room number in the URL (`/room/204`), guest never types it | `app/room/[room]/` |
| Three category pages, content-model driven | `lib/menu.ts`, `app/room/[room]/[category]/` |
| F&B 10:00–04:00 only (menu still browseable), Adventure/Taxi 24/7 | `lib/hours.ts` (handles the midnight-wrap) |
| Stripe Checkout, Malta-compatible | `lib/stripe.ts` (Stripe-hosted, EUR, PCI off our server) |
| Automated owner email per order | `lib/notify.ts` |
| WhatsApp Business API → 3 numbers by category, backend only | `lib/notify.ts` (Meta/Twilio pluggable, dry-run without creds) |
| 86 unique QR codes (PNG + printable PDF) | `npm run gen:qr -- https://domain.mt` → `qrcodes/` |
| Repeat orders + 30s double-tap block | `lib/orders.ts` (server-enforced, per room) |
| English now, IT + FR prepped | `lib/i18n.ts` (all copy via `t()`) |
| < 3s on hotel Wi-Fi, almost no motion | server components, minimal JS, no kinetic UI |

## Payments

With `STRIPE_SECRET_KEY` (test mode) set, checkout is a **real Stripe-hosted page** — drop in `4242 4242 4242 4242`, any future date/CVC. Without a key, a clearly-labeled **simulated** payment runs the identical order + routing flow so the public demo never breaks. The Stripe **webhook** (`/api/webhook/stripe`) is the production-authoritative confirmation (survives the guest closing the tab); `/api/confirm` keeps the demo reliable without a webhook secret.

## Run locally

```bash
npm install
cp .env.example .env       # optional: add Stripe test keys + WhatsApp creds
npm run dev                # http://localhost:3000  (try /room/204)
npm run gen:qr -- http://localhost:3000   # writes qrcodes/
```

## Production path

Postgres/Redis for orders + cooldown (one-line swap behind the `lib/orders` interface), Stripe webhook secret, Meta Cloud API number per category, Resend/SES for owner email, custom domain on Vercel.

## Built by

**Waseem Iftikhar** — full-stack / AI engineer, 7 yrs production.
GitHub: github.com/waseem253 · Upwork: upwork.com/freelancers/~0166938f759e168a91
