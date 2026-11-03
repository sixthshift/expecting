import { createContext, type ReactNode, use, useMemo } from "react";
import type { StoryItem } from "../../../lib/journal/story/items";
import { useStoryItems } from "../hooks/useStoryItems";

/**
 * The Journal's context: what must be worked out once. What only one part
 * needs, that part works out (the view, a collection's lines). While
 * something has happened the Journal is the quiet one, with its own context
 * (`QuietJournalPageProvider`, `quiet/contexts/`).
 */
export type JournalPage = {
  /** The story: everything kept, and what was done, newest first: `storyItems` over the queries, built once. */
  items: StoryItem[];
};

const PageContext = createContext<JournalPage | null>(null);

/**
 * The Journal's context: its data layer, what its pages draw, worked out
 * once. It holds no data of its own: the queries stay in the query cache,
 * read through their hooks. The story is built here once (`useStoryItems`).
 */
export function JournalPageProvider({ children }: { children: ReactNode }) {
  const items = useStoryItems();
  const page = useMemo(() => ({ items }), [items]);
  return <PageContext value={page}>{children}</PageContext>;
}

/** What the Journal's pages draw, inside `JournalPageProvider`. */
export function useJournalPage(): JournalPage {
  const page = use(PageContext);
  if (!page) throw new Error("useJournalPage must be called inside JournalPageProvider");
  return page;
}
