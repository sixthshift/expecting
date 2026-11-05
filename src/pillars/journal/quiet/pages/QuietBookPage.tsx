import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { JournalTabs } from "../../components/JournalTabs";
import { JournalRail } from "../../desktop/components/JournalRail";

/** The book while something has happened, the route's quiet world (`worlds`): only a line. Everything kept is in the Journal, as it was. */
export function QuietBookPage() {
  return (
    <PillarLayout rail={<JournalRail />} tabs={{ title: "Journal", nav: <JournalTabs current="book" /> }} back={{ to: "/journal", label: "The Journal" }}>
      <div className="max-w-3xl">
        <p className="py-10 text-fg-subtle">Everything you kept is in the Journal, as it was.</p>
      </div>
    </PillarLayout>
  );
}
