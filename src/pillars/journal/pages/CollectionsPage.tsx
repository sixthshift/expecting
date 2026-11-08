import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { Collections } from "../components/collections/Collections";
import { JournalTabs } from "../components/JournalTabs";
import { JournalRail } from "../desktop/components/JournalRail";

/**
 * The Journal's collections: everything kept, grouped by what it is, each
 * with its answer at the top (the midwife's "since when?", the paper asked
 * for at triage, the bump so far) and opened in full (`CollectionPage`).
 * The story is everything by time (`JournalTabs`' other way in). See
 * docs/product/journal.md, The collections.
 */
export function CollectionsPage() {
  return (
    <PillarLayout rail={<JournalRail />} tabs={{ title: "Journal", nav: <JournalTabs current="collections" /> }} width="full" title="Journal" className="gap-6">
      <Collections />
    </PillarLayout>
  );
}
