import { builtInItems, loadPage } from "../../../content";
import type { Item, ItemPage } from "../../../content/schema";

const pages = new Map<string, Promise<ItemPage>>();

/**
 * An item's page, loaded once and kept: the same promise each time, as `use()`
 * needs. Once loaded it says so on itself (`status`, `value`, as React reads a
 * thenable), so `use()` reads it at once instead of suspending for a tick: a
 * page loaded ahead (preloadPage) opens whole, with no spinner between.
 */
export function pageOf(item: Item): Promise<ItemPage> {
  let page = pages.get(item.id);
  if (!page) {
    const loading = loadPage(item);
    loading.then(
      (value) => Object.assign(loading, { status: "fulfilled", value }),
      (reason: unknown) => Object.assign(loading, { status: "rejected", reason })
    );
    page = loading;
    pages.set(item.id, page);
  }
  return page;
}

/**
 * Start loading an item's page by its id, for the route's loader: the page
 * changes once the words are here, so it opens whole rather than on a
 * spinner, and a link pressed (or hovered) has them on the way already. An
 * id that isn't an item is left to the page to say so.
 */
export async function preloadPage(itemId: string): Promise<void> {
  const item = builtInItems.find((i) => i.id === itemId);
  if (item) await pageOf(item).catch(() => undefined);
}
