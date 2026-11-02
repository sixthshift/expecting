// A place Expecting has made ready, and the way in to fill it.

import { Card } from "@sixthshift/design-system/card";
import { Modal } from "@sixthshift/design-system/modal";
import { Camera, FileText } from "lucide-react";
import { useState } from "react";
import { CaptureSheet } from "../../../../../app/features/capture/components/CaptureSheet";
import type { Place } from "../../../../../lib/journal/places";
import { AddPhoto } from "../../../features/photos/components/AddPhoto";

/** A place Expecting has made ready: its sentence, and the place itself as the way in, an empty card waiting to be filled. */
export function PlaceReady({ place }: { place: Place }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <Card variant="placeholder" onClick={() => setOpen(true)} className="flex items-center gap-4">
        <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-bg-subtle text-fg-subtle">
          {place.kind === "paper" ? <FileText size={20} /> : <Camera size={20} />}
        </span>
        <span className="text-fg-normal">{place.says}</span>
      </Card>
      {open && place.kind === "paper" ? <CaptureSheet initial="paper" onClose={() => setOpen(false)} /> : null}
      {open && place.kind !== "paper" ? (
        <Modal
          size="sm"
          align="top"
          closable
          onOpenChange={(o) => (o ? null : setOpen(false))}
          aria-label={place.kind === "bump" ? "A bump photo" : "The scan"}
        >
          <Modal.Header>
            <h2 className="font-display text-lg font-semibold text-fg-strong">{place.kind === "bump" ? "A bump photo" : "The scan"}</h2>
          </Modal.Header>
          <Modal.Body className="px-6 pb-6">
            <AddPhoto kind={place.kind === "bump" ? "bump" : "scan"} onAdded={() => setOpen(false)} />
          </Modal.Body>
        </Modal>
      ) : null}
    </li>
  );
}
