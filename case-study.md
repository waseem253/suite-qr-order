# Suite QR Order — Guest-Facing Hotel Ordering

**Live demo:** https://suite-qr-order.vercel.app/room/204

## The problem

An 86-room Maltese hotel wanted guests to scan a QR in their room and order Food & Beverage, Adventure experiences, or a Taxi — paid online, premium feel, with each order reaching the right team automatically and the guest never seeing the backend.

## The build

A Next.js app: the room number is in the URL (`/room/204`, guest never types it); three content-driven category pages; F&B orderable 10:00–04:00 Malta time (window crosses midnight) while the menu stays browseable outside hours; Adventure & Taxi 24/7; real Stripe-hosted Checkout (card data never touches the server); an on-screen confirmation; a server-enforced 30-second double-tap block per room; English at launch with Italian + French scaffolded. Every paid order emails the owner and posts to one of three WhatsApp Business API numbers by category, fully backend.

## Architecture

```
Room QR → Next.js → category pages → Stripe Checkout
   → webhook-authoritative confirmation
       → owner email  +  WhatsApp routed by category (F&B / Adventure / Taxi)
       → on-screen confirmation + 30s double-tap block
```

Stripe, WhatsApp (Meta/Twilio) and the order store sit behind interfaces. With Stripe test keys it's a real card-entry page (`4242…`); without, a clearly-labeled simulated payment runs the identical flow so the demo never breaks. The Stripe webhook is the production-authoritative path — the owner is notified even if the guest closes the tab.

## Why it matters

- **Real payments, real edges** — midnight-crossing service hours, PCI kept off-server, idempotent notify, server-enforced anti-double-tap.
- **Webhook-authoritative** — order notifications survive a closed tab.
- **i18n-ready** — EN now, IT/FR are a content drop, not a refactor.

## Stack

Next.js 16 (App Router) · TypeScript · Stripe Checkout · WhatsApp Business API · Vercel

---

**Waseem Iftikhar** — AI / Full-stack Engineer
