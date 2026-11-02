import { createContext, type ReactNode, use, useMemo } from "react";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useAnswersQuery } from "../../../api/rpc/facts";
import { builtInItems } from "../../../content";
import type { Item, ItemPage } from "../../../content/schema";
import { extrasOn } from "../../../lib/extras";
import { factsOf } from "../../../lib/facts";
import { type Extra, extra } from "../../settings/model/extras";
import { useItems } from "../hooks/useItems";
import { pageOf } from "../model/pageOf";

/**
 * An entry's page: what's worked out once from the id in its address. What
 * only one part needs, that part works out (the way back, the list it was
 * opened from, whether it's read).
 */
export type LibraryItemPage = {
  /** The id in the address: an entry's, or an old or cut-short link's. */
  itemId: string;
  /** The entry, as your Library has it; undefined when it's hidden, or there's none by this id. */
  item: Item | undefined;
  /** An entry hidden by an answer or an extra that's off, rather than not there at all. */
  hidden: Item | undefined;
  /** The question whose answer hides it, to open settings at. */
  hiddenBy: string | undefined;
  /** The extra it's part of, while that's off. */
  offExtra: Extra | undefined;
  /** Its words, loaded once and kept (`pageOf`): read through `useEntry`, under a Suspense. */
  page: Promise<ItemPage> | undefined;
};

const PageContext = createContext<LibraryItemPage | null>(null);

/**
 * An entry's page, worked out once from `itemId`: the entry as your Library
 * has it, or why it isn't there (an answer, an extra that's off, or no entry
 * by that id), and its words on the way. It holds no data of its own: your
 * answers and extras stay in the query cache, read through their hooks.
 */
export function LibraryItemPageProvider({ itemId, children }: { itemId: string; children: ReactNode }) {
  const items = useItems();
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: extras } = useExtrasQuery({ select: extrasOn });
  const item = items.find((i) => i.id === itemId);
  // Hidden by an answer, rather than not there at all: say so, and open settings at it.
  const hidden = item ? undefined : builtInItems.find((i) => i.id === itemId);
  const offExtra = hidden?.extra && !extras.has(hidden.extra) ? extra(hidden.extra) : undefined;
  const hiddenBy = hidden ? Object.entries(hidden.when).find(([key, answers]) => facts[key] !== undefined && !answers.includes(facts[key]))?.[0] : undefined;
  const page = item ? pageOf(item) : undefined;

  const value = useMemo(() => ({ itemId, item, hidden, hiddenBy, offExtra, page }), [itemId, item, hidden, hiddenBy, offExtra, page]);

  return <PageContext value={value}>{children}</PageContext>;
}

/** What an entry's page draws, inside `LibraryItemPageProvider`. */
export function useLibraryItemPage(): LibraryItemPage {
  const page = use(PageContext);
  if (!page) throw new Error("useLibraryItemPage must be called inside LibraryItemPageProvider");
  return page;
}

/** The entry and its words, for the parts drawn only under one: suspends until the words are here. */
export function useEntry(): { item: Item; page: ItemPage } {
  const { item, page } = useLibraryItemPage();
  if (!item || !page) throw new Error("useEntry must be called on an entry's page, under its entry");
  return { item, page: use(page) };
}
