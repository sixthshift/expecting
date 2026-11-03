import { useQuietKind } from "../../../app/features/quiet/hooks/useQuietKind";
import { Journal } from "../components/story/Journal";
import { JournalPageProvider } from "../contexts/JournalPageContext";
import { QuietJournalPageProvider } from "../quiet/contexts/QuietJournalPageContext";
import { QuietJournalPage } from "../quiet/pages/QuietJournalPage";

/**
 * The Journal: the pregnancy, kept and given back, as one story: everything
 * kept and done, newest first under its week and day, opening on this week
 * as its own page; as one kind, searched, or zoomed out to weeks or the whole
 * pregnancy. Adding is the "+". It shows what's kept, never what's missing. See
 * docs/product/journal.md.
 *
 * Two worlds, chosen here and nowhere else: `Journal` in its context
 * (`JournalPageProvider`) or, while something has happened, `QuietJournalPage`
 * in its own (`QuietJournalPageProvider`, `quiet/`), each written as what it
 * is. They share the story's parts (`components/story/`, `components/lines/`).
 *
 * The Journal is one part, `JournalStory`; the quiet one, `QuietStory` and
 * `KeptBefore`. Above both, the way to the records (`JournalTabs`,
 * `CollectionsPage`), what's kept said in a few lines, to look up.
 */
export function JournalPage() {
  const quiet = useQuietKind();
  return quiet ? (
    <QuietJournalPageProvider kind={quiet}>
      <QuietJournalPage />
    </QuietJournalPageProvider>
  ) : (
    <JournalPageProvider>
      <Journal />
    </JournalPageProvider>
  );
}
