/**
 * i18n scaffold. English ships at launch; Italian and French are wired
 * structurally so adding them later is a content task, not a refactor —
 * exactly the "prepped for IT + FR" requirement. All guest-facing copy
 * resolves through t().
 */
export type Locale = "en" | "it" | "fr";

type Dict = Record<string, string>;

const en: Dict = {
  "room.welcome": "Welcome to Room",
  "room.subtitle": "How may we look after you?",
  "order.title": "Your order",
  "order.empty": "Tap items to add them.",
  "order.place": "Pay & place order",
  "order.total": "Total",
  "order.closed": "Ordering closed",
  "success.title": "Order confirmed",
  "success.body": "Thank you. Our team has been notified and will be in touch shortly.",
  "success.cooldown": "You can place another order in",
  "back": "Back",
};

// Stubs — same keys, filled with the client's translations later.
const it: Dict = { ...en };
const fr: Dict = { ...en };

const DICTS: Record<Locale, Dict> = { en, it, fr };

export const LOCALES: Locale[] = ["en", "it", "fr"];

export function t(key: string, locale: Locale = "en"): string {
  return DICTS[locale]?.[key] ?? en[key] ?? key;
}
