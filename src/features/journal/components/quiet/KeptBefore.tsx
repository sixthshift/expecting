import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { useState } from "react";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { kindsOffered } from "../../../../lib/photos";
import { foldedWhileQuiet, storyGroups } from "../../../../lib/story";
import { useJournalPage } from "../../contexts/JournalPageContext";
import { AddPhoto } from "../entries/photos/AddPhoto";
import { StoryList } from "../story/Story";

/** What's folded away, behind one quiet line, with one quiet way to add a photo. */
export function KeptBefore() {
  const { quiet, items } = useJournalPage();
  const folded = items.filter(foldedWhileQuiet);
  const { data: settings } = useSettingsQuery();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
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
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setAdding(true)}>
        Add a photo
      </Button>
      <StoryList groups={storyGroups(folded, settings.dueDate)} label="What you kept before" titled={false} />
      {adding ? (
        <Modal size="sm" align="top" closable onOpenChange={(o) => (o ? null : setAdding(false))} aria-label="Add a photo">
          <Modal.Header>
            <h2 className="font-display text-lg font-semibold text-fg-strong">Add a photo</h2>
          </Modal.Header>
          <Modal.Body className="px-6 pb-6">
            <AddPhoto kinds={kindsOffered(quiet)} onAdded={() => setAdding(false)} />
          </Modal.Body>
        </Modal>
      ) : null}
    </section>
  );
}
