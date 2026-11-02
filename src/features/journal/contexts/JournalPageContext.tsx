import { getRouteApi } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useMemo, useState } from "react";
import { useQuiet } from "../../../api/rpc/quiet";
import { type Lens, lensesKept, type StoryItem } from "../../../lib/story";
import { type HighlightsData, useHighlights } from "../hooks/useHighlights";
import { useStory } from "../hooks/useStory";

const route = getRouteApi("/app/journal");

/** What the Journal's parts share, worked out once: the story, its lenses, the highlights, and whether the week draws its days. */
export type JournalPage = {
  /** The story: everything kept, and what was done, newest first (`useStory`). */
  items: StoryItem[];
  /** The lens open (`?show=`, or all when it has nothing), and the lenses there's something in. */
  lens: Lens;
  lenses: Lens[];
  highlights: HighlightsData;
  /** False while the story is in a lens, zoomed or searched, when this week's days aren't drawn in the week so far. */
  withDays: boolean;
};

/** The words the story is searched with, and their setter. */
export type JournalSearch = { words: string; setWords: (words: string) => void };

// Two contexts, so typing in the search draws again only what reads it, not the (memo) week so far.
const PageContext = createContext<JournalPage | null>(null);
const SearchContext = createContext<JournalSearch | null>(null);

/**
 * The Journal page's context: what its parts share, worked out once for the
 * page. It holds no data of its own: the queries stay in the query cache,
 * read through their hooks. The story is built here once for the page's
 * parts, and `useHighlights` is called here and nowhere else, as it marks the
 * Journal seen and keeps when you last looked.
 */
export function JournalPageProvider({ children }: { children: ReactNode }) {
  const { zoom, show } = route.useSearch();
  const items = useStory();
  const { data: quiet } = useQuiet();
  const isQuiet = Boolean(quiet);
  const lenses = useMemo(() => lensesKept(items, isQuiet), [items, isQuiet]);
  const lens = show && lenses.includes(show) ? show : "all";
  const highlights = useHighlights(items);
  const [words, setWords] = useState("");
  const withDays = lens === "all" && !zoom && words.trim().length === 0;

  const page = useMemo(() => ({ items, lens, lenses, highlights, withDays }), [items, lens, lenses, highlights, withDays]);
  const search = useMemo(() => ({ words, setWords }), [words]);

  return (
    <PageContext value={page}>
      <SearchContext value={search}>{children}</SearchContext>
    </PageContext>
  );
}

/** The Journal page's shared parts, inside `JournalPageProvider`. */
export function useJournalPage(): JournalPage {
  const page = use(PageContext);
  if (!page) throw new Error("useJournalPage is used inside JournalPageProvider");
  return page;
}

/** The story's search words, inside `JournalPageProvider`. */
export function useJournalSearch(): JournalSearch {
  const search = use(SearchContext);
  if (!search) throw new Error("useJournalSearch is used inside JournalPageProvider");
  return search;
}
