import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { JournalTabs } from "../../components/JournalTabs";
import { JournalRail } from "../../desktop/components/JournalRail";
import { KeptBefore } from "../components/KeptBefore";
import { QuietStory } from "../components/QuietStory";
import { QuietJournalPageProvider } from "../contexts/QuietJournalPageContext";

/**
 * The Journal while something has happened, the route's quiet world
 * (`worlds`): the story, as kept, in its own context
 * (`QuietJournalPageProvider`), rendered as what it is. No week counted and
 * nothing about the baby: no call to make, no week's page, no places made
 * ready, no firsts and no book. The story of what stays (the notes, letters,
 * feelings, papers and what was done); and what's folded away, behind one
 * quiet line. See docs/product/journal.md, While something has happened.
 */
export function QuietJournalPage() {
  return (
    <QuietJournalPageProvider>
      <PillarLayout rail={<JournalRail />} tabs={{ title: "Journal", nav: <JournalTabs current="story" /> }} title="Journal" className="gap-6">
        <QuietStory />
        <KeptBefore />
      </PillarLayout>
    </QuietJournalPageProvider>
  );
}
