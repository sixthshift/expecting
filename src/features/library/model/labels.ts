import type { Item } from "../../../content/schema";
import { weekLabel } from "../../../lib/timeline";

/** "Week 28", "Weeks 28–36"; null for one without weeks. */
export function rangeLabel(item: Item): string | null {
  if (item.from === null) return null;
  return item.from === item.to ? weekLabel(item.from) : `Weeks ${item.from}–${item.to}`;
}
