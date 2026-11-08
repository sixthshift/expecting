import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { storyGroups } from "../../../../lib/journal/story/spine";
import { StoryList } from "../../components/lines/StoryList";
import { QuietAddPhoto } from "../../features/photos/quiet/components/QuietAddPhoto";
import { useQuietJournalPage } from "../contexts/QuietJournalPageContext";

/** What's folded away, behind one quiet line, with one quiet way to add a photo. */
export function KeptBefore() {
  const { kind, folded } = useQuietJournalPage();
  const { data: settings } = useSettingsQuery();
  const [open, setOpen] = useState(false);
  if (folded.length === 0) return null;
  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="self-start text-fg-subtle" onClick={() => setOpen(true)}>
        What you kept before
      </Button>
    );
  }
  return (
    <section aria-label="What you kept before" className="flex flex-col gap-4">
      <QuietAddPhoto quiet={kind} />
      <StoryList groups={storyGroups(folded, settings.dueDate)} label="What you kept before" titled={false} />
    </section>
  );
}
