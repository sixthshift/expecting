import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { JournalTabs } from "../components/JournalTabs";
import { JournalStory } from "../components/journal/JournalStory";
import { KeptBefore } from "../components/quiet/KeptBefore";
import { QuietStory } from "../components/quiet/QuietStory";
import { JournalPageProvider, useJournalPage } from "../contexts/JournalPageContext";

/**
 * The Journal: the pregnancy, kept and given back, as one story: everything
 * kept and done, newest first under its week and day, opening on this week
 * as its own page; in a lens, searched, or zoomed out to weeks or the whole
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

/** The page's layout, inside its provider: one column, the pillar's full width (max-w-6xl). */
function Journal() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex min-w-0 flex-col gap-6">
        <JournalTabs current="story" />
        <JournalStory />
      </div>
    </main>
  );
}

/**
 * The Journal while something has happened: the story, as kept. Drawn by
 * `JournalPage` from the same context as the Journal (`JournalPageProvider`),
 * rendered as what it is. No week counted and nothing about the baby: no
 * call to make, no week's page, no places made ready, no firsts and no
 * book. The story of what stays
 * (the notes, letters, feelings, papers and what was done); and what's
 * folded away, behind one quiet line. See docs/product/journal.md, While
 * something has happened.
 */
function QuietJournal() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex flex-col gap-8">
        <JournalTabs current="story" />
        <div className="flex min-w-0 flex-col gap-4">
          <QuietStory />
          <KeptBefore />
        </div>
      </div>
    </main>
  );
}
