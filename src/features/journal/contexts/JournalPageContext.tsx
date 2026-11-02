import { getRouteApi } from "@tanstack/react-router";
import { createContext, type ReactNode, use, useMemo, useState } from "react";
import { type HighlightsData, useHighlights } from "../hooks/useHighlights";
import { useLens } from "../hooks/useLens";

const route = getRouteApi("/app/journal");

/** What the Journal's parts share: the highlights, worked out once, and whether the week draws its days. */
export type JournalPage = {
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
 * read through their hooks. `useHighlights` is called here and nowhere else,
 * as it marks the Journal seen and keeps when you last looked.
 */
export function JournalPageProvider({ children }: { children: ReactNode }) {
  const { zoom } = route.useSearch();
  const highlights = useHighlights();
  const { lens } = useLens();
  const [words, setWords] = useState("");
  const withDays = lens === "all" && !zoom && words.trim().length === 0;

  const page = useMemo(() => ({ highlights, withDays }), [highlights, withDays]);
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
