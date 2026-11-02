import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { JournalTabs } from "../JournalTabs";
import { KeptBefore } from "./KeptBefore";
import { QuietStory } from "./QuietStory";

/**
 * The Journal while something has happened: the story, as kept. Drawn by
 * `JournalPage` from the same context as the Journal (`JournalPageProvider`),
 * rendered as what it is. No week counted and nothing about the baby: no
 * call to make, no week's page, no places made ready, no firsts and no
 * book. The story of what stays (the notes, letters, feelings, papers and
 * what was done); and what's folded away, behind one quiet line. See
 * docs/product/journal.md, While something has happened.
 */
export function QuietJournal() {
  return (
    <PillarLayout title="Journal" className="gap-6">
      <JournalTabs current="story" />
      <QuietStory />
      <KeptBefore />
    </PillarLayout>
  );
}
