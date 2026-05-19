/**
 * Content model. The client supplies the real menu items, photos,
 * descriptions and prices — this is realistic placeholder content with
 * the exact shape their data drops into. Three categories, as specified:
 * Food & Beverage, Adventure, Taxi.
 *
 * Prices are integer euro-cents (Stripe-native, no float rounding bugs).
 */

export type CategoryId = "fnb" | "adventure" | "taxi";

export interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: number; // euro cents
  tag?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
  always: boolean; // true = 24/7 (Adventure, Taxi)
  items: MenuItem[];
}

export const CATEGORIES: Record<CategoryId, Category> = {
  fnb: {
    id: "fnb",
    name: "Food & Beverage",
    blurb: "In-room dining, served to your door.",
    always: false, // 10:00–04:00 only
    items: [
      { id: "fnb-mezze", name: "Maltese Mezze Platter", desc: "Ġbejniet, bigilla, sun-dried tomato, water biscuits", price: 1650 },
      { id: "fnb-lampuki", name: "Lampuki Fillet", desc: "Pan-seared dorado, caper & lemon butter, seasonal greens", price: 2600, tag: "Chef's pick" },
      { id: "fnb-rabbit", name: "Fenkata Stew", desc: "Slow-braised rabbit, red wine, garlic, served with bread", price: 2400 },
      { id: "fnb-ftira", name: "Gozitan Ftira", desc: "Tuna, potato, olives, capers, Maltese sourdough", price: 1450 },
      { id: "fnb-wine", name: "Marsovin Red (375ml)", desc: "Local Ġellewża blend, light and bright", price: 1900 },
      { id: "fnb-kinnie", name: "Kinnie & Ice", desc: "Malta's bittersweet citrus classic", price: 450 },
    ],
  },
  adventure: {
    id: "adventure",
    name: "Adventure",
    blurb: "Curated island experiences. Available any time.",
    always: true,
    items: [
      { id: "adv-bluegrotto", name: "Blue Grotto Boat Tour", desc: "Private skipper, ~2h, hotel pickup", price: 6500, tag: "Popular" },
      { id: "adv-dive", name: "Guided Discovery Dive", desc: "Cirkewwa reef, all gear, PADI pro", price: 9000 },
      { id: "adv-mdina", name: "Mdina Evening Walk", desc: "Silent City guided tour, small group", price: 3500 },
      { id: "adv-comino", name: "Comino & Blue Lagoon Day", desc: "Boat, lunch, snorkel set", price: 7800 },
    ],
  },
  taxi: {
    id: "taxi",
    name: "Taxi",
    blurb: "Fixed-fare transfers with vetted drivers. 24/7.",
    always: true,
    items: [
      { id: "taxi-airport", name: "Airport Transfer", desc: "Hotel ↔ Malta International, up to 4 pax", price: 3000 },
      { id: "taxi-valletta", name: "Valletta Drop-off", desc: "One way to the capital", price: 2200 },
      { id: "taxi-hour", name: "Driver by the Hour", desc: "Private car & driver, per hour", price: 4000 },
      { id: "taxi-ferry", name: "Gozo Ferry Run", desc: "To Ċirkewwa terminal", price: 3500 },
    ],
  },
};

export const CATEGORY_ORDER: CategoryId[] = ["fnb", "adventure", "taxi"];

export function getCategory(id: string): Category | null {
  return (CATEGORIES as Record<string, Category>)[id] ?? null;
}

export function eur(cents: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
