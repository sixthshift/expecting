import { createContext, type ReactNode, use, useMemo } from "react";
import { useQuietKind } from "../../../../app/features/quiet/hooks/useQuietKind";
import { foldedWhileQuiet } from "../../../../lib/journal/quiet";
import type { StoryItem } from "../../../../lib/journal/story/items";
import type { QuietKind } from "../../../../lib/quiet";
import { useStoryItems } from "../../hooks/useStoryItems";

/**
 * The quiet Journal's context: what has happened, and the story split once
 * into what stays (`QuietStory`) and what's folded away (`KeptBefore`).
 */
export type QuietJournalPage = {
  /** What has happened: null only once it's lifted, before the route draws the other world. */
  kind: QuietKind | null;
  /** The lines that stay (the notes, letters, feelings, papers and what was done), newest first. */
  shown: StoryItem[];
  /** The lines folded away (`foldedWhileQuiet`), newest first. */
  folded: StoryItem[];
};

const PageContext = createContext<QuietJournalPage | null>(null);

/**
 * The quiet Journal's context, drawn by `QuietJournalPage` while something
 * has happened. It holds no data of its own: what has happened is the quiet
 * query's (`useQuietKind`), and the story is built from the queries
 * (`useStoryItems`), then split by `foldedWhileQuiet`.
 */
export function QuietJournalPageProvider({ children }: { children: ReactNode }) {
  const kind = useQuietKind();
  const items = useStoryItems();
  const page = useMemo(() => ({ kind, shown: items.filter((i) => !foldedWhileQuiet(i)), folded: items.filter(foldedWhileQuiet) }), [kind, items]);
  return <PageContext value={page}>{children}</PageContext>;
}

/** What the quiet Journal draws, inside `QuietJournalPageProvider`. */
export function useQuietJournalPage(): QuietJournalPage {
  const page = use(PageContext);
  if (!page) throw new Error("useQuietJournalPage must be called inside QuietJournalPageProvider");
  return page;
}
