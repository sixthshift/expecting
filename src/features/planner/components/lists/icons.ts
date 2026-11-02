import {
  Baby,
  Bath,
  Car,
  CookingPot,
  Heart,
  Layers,
  ListTodo,
  type LucideIcon,
  Milk,
  Moon,
  Package,
  Shirt,
  ShoppingBasket,
  Snowflake,
  Sparkles,
} from "lucide-react";

/** Each built-in list's icon; your own lists share one. */
const LIST_ICONS: Record<string, LucideIcon> = { baby: Baby, "freezer-meals": Snowflake };

/** Each section's icon, by its key; your own lines' heading by its list. */
const SECTION_ICONS: Record<string, LucideIcon> = {
  sleep: Moon,
  "out-and-about": Car,
  feeding: Milk,
  changing: Layers,
  bathing: Bath,
  clothes: Shirt,
  "for-you": Heart,
  pantry: ShoppingBasket,
  kit: Package,
};

const YOURS_ICONS: Record<string, LucideIcon> = { baby: Sparkles, "freezer-meals": CookingPot };

export function listIcon(listId: string): LucideIcon {
  return LIST_ICONS[listId] ?? ListTodo;
}

/** A section's icon; null for a list of your own's one part, which has no heading. */
export function sectionIcon(listId: string, key: string | null): LucideIcon | null {
  if (key !== null) return SECTION_ICONS[key] ?? null;
  return YOURS_ICONS[listId] ?? null;
}
