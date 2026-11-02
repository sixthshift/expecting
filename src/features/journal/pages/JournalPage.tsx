import { JournalFrame } from "../components/JournalFrame";
import { KeptBefore } from "../components/quiet/KeptBefore";
import { QuietStory } from "../components/quiet/QuietStory";
import { JournalStory } from "../components/story/JournalStory";
import { JournalPageProvider, useJournalPage } from "../contexts/JournalPageContext";

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
 * `KeptBefore`. Above both, the way to the records (`JournalFrame`,
 * `RecordsPage`), what's kept said in a few lines, to look up.
 */
export function JournalPage() {
  return (
    <JournalPageProvider>
      <Rendering />
    </JournalPageProvider>
  );
}

/** Which page draws the context: the quiet Journal while something has happened. */
function Rendering() {
  const { quiet } = useJournalPage();
  return quiet ? <QuietJournal /> : <Journal />;
}

/** The Journal: its story. */
function Journal() {
  return (
    <JournalFrame current="story">
      <JournalStory />
    </JournalFrame>
  );
}

/**
 * The Journal while something has happened: the story, as kept. Drawn by
 * `JournalPage` from the same context as the Journal (`JournalPageProvider`),
 * rendered as what it is. No week counted and nothing about the baby: no
 * call to make, no week's page, no places made ready, no firsts and no
 * book. The story of what stays (the notes, letters, feelings, papers and
 * what was done); and what's folded away, behind one quiet line. See
 * docs/product/journal.md, While something has happened.
 */
function QuietJournal() {
  return (
    <JournalFrame current="story">
      <QuietStory />
      <KeptBefore />
    </JournalFrame>
  );
}
