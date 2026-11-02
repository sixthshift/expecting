import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { JournalTabs } from "../JournalTabs";
import { JournalStory } from "./JournalStory";

/** The Journal: its story. */
export function Journal() {
  return (
    <PillarLayout title="Journal" className="gap-6">
      <JournalTabs current="story" />
      <JournalStory />
    </PillarLayout>
  );
}
