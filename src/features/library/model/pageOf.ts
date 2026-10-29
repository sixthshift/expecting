import { loadPage } from "../../../content";
import type { Item, ItemPage } from "../../../content/schema";

const pages = new Map<string, Promise<ItemPage>>();

/** An item's page, loaded once and kept: the same promise each time, as `use()` needs. */
export function pageOf(item: Item): Promise<ItemPage> {
  let page = pages.get(item.id);
  if (!page) {
    page = loadPage(item);
    pages.set(item.id, page);
  }
  return page;
}
