import { Button } from "@sixthshift/design-system/button";
import { Markdown } from "@sixthshift/design-system/markdown";
import { Modal } from "@sixthshift/design-system/modal";
import { useState } from "react";
import { type Release, releases, releasesSince } from "../../content/releases";
import { VERSION } from "../../lib/version";
import { markSeen, seenVersion } from "../model/seenVersion";

/**
 * What's new since this phone last looked, once, after an update: every release
 * between the version it last saw and the one running. Dismissing it in any way
 * counts as seen. Nothing to say, and the phone moves on quietly.
 */
export function WhatsNew() {
  const [shown] = useState(() => {
    const unseen = releasesSince(releases, seenVersion(VERSION), VERSION);
    if (unseen.length === 0) markSeen(VERSION);
    return unseen;
  });
  const [open, setOpen] = useState(shown.length > 0);
  if (!open) return null;

  const close = () => {
    markSeen(VERSION);
    setOpen(false);
  };

  return <ReleaseNotes title="What's new in Expecting" shown={shown} onClose={close} />;
}

/** The notes for `shown` (oldest first) in a dialog, newest first, each under its version when there's more than one. */
export function ReleaseNotes({ title, shown, onClose }: { title: string; shown: readonly Release[]; onClose: () => void }) {
  return (
    <Modal size="md" onOpenChange={(next) => !next && onClose()}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body className="flex flex-col gap-5">
        {[...shown].reverse().map((release) => (
          <section key={release.version} className="flex flex-col gap-1">
            {shown.length > 1 && <p className="text-xs text-fg-subtle">{release.version}</p>}
            <Markdown>{release.notes}</Markdown>
          </section>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button intent="brand" onClick={onClose}>
          Got it
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
