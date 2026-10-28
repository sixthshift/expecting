// The Library's shelves, in order. Pure, so the order is tested apart from
// the screen:
//
//   surprise   the things nobody tells you
//   topics     a shelf per topic, in their usual order
//
// An item sits on its topic's shelf; a surprise is on both. Search, on the
// page, looks through everything.

import { CATEGORIES, type Category, type Item } from "../content/schema";

export type Shelf = {
  key: string;
  title: string;
  items: Item[];
  /** Drawn as cards, the things nobody tells you. */
  surprise: boolean;
};

export function arrangeLibrary(items: readonly Item[]): Shelf[] {
  const topics = (Object.keys(CATEGORIES) as Category[]).map(
    (c): Shelf => ({ key: c, title: CATEGORIES[c], items: items.filter((i) => i.category === c), surprise: false })
  );
  return [{ key: "surprise", title: "Nobody tells you", items: items.filter((i) => i.surprise), surprise: true }, ...topics].filter((s) => s.items.length > 0);
}
