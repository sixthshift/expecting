import { JournalRendering } from "../components/JournalRendering";
import { JournalPageProvider } from "../contexts/JournalPageContext";

/**
 * The Journal: the pregnancy, kept and given back, as one story: everything
 * kept and done, newest first under its week and day, opening on this week
 * as its own page; as one kind, searched, or zoomed out to weeks or the whole
 * pregnancy. Adding is the "+". It shows what's kept, never what's missing. See
 * docs/product/journal.md.
 *
 * One context, two renderings: `JournalPageProvider` is the Journal's data
 * layer, and what it draws is `Journal` or, while something has happened,
 * `QuietJournal`, each written as what it is. They share the story's parts
 * (`components/story/`).
 *
 * The Journal is one part, `JournalStory`; the quiet one, `QuietStory` and
 * `KeptBefore`. Above both, the way to the records (`JournalTabs`,
 * `CollectionsPage`), what's kept said in a few lines, to look up.
 */
export function JournalPage() {
  return (
    <JournalPageProvider>
      <JournalRendering />
    </JournalPageProvider>
  );
}
