import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { JournalTabs } from "../components/JournalTabs";
import { JournalStory } from "../components/story/JournalStory";
import { JournalPageProvider } from "../contexts/JournalPageContext";
import { JournalRail } from "../desktop/components/JournalRail";

/**
 * The Journal: the pregnancy, kept and given back, as one story: everything
 * kept and done, newest first under its week and day, opening on this week
 * as its own page; as one kind, searched, or zoomed out to weeks or the whole
 * pregnancy. Adding is the "+". It shows what's kept, never what's missing. See
 * docs/product/journal.md.
 *
 * Two worlds, chosen by the route (`worlds`): this one in its context
 * (`JournalPageProvider`) or, while something has happened,
 * `QuietJournalPage` in its own (`QuietJournalPageProvider`, `quiet/`), each
 * written as what it is. They share the story's parts (`components/story/`,
 * `components/lines/`).
 *
 * The Journal is one part, `JournalStory`; the quiet one, `QuietStory` and
 * `KeptBefore`. Above both, the way to the records (`JournalTabs`,
 * `CollectionsPage`), what's kept said in a few lines, to look up.
 */
export function JournalPage() {
  return (
    <JournalPageProvider>
      <PillarLayout rail={<JournalRail />} tabs={{ title: "Journal", nav: <JournalTabs current="story" /> }} title="Journal" className="gap-6">
        <JournalStory />
      </PillarLayout>
    </JournalPageProvider>
  );
}
