// The places Expecting has made ready now, above the story, each with the
// way in to fill it.

import { Card } from "@sixthshift/design-system/card";
import { Camera, FileText } from "lucide-react";
import { useState } from "react";
import { CaptureSheet } from "../../../../../app/features/capture/components/CaptureSheet";
import type { Place } from "../../../../../lib/journal/places";
import { AddPhotoModal } from "../../../features/photos/components/AddPhoto";

/** A place Expecting has made ready: its sentence, and the place itself as the way in, an empty card waiting to be filled. */
function PlaceReady({ place }: { place: Place }) {
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
        <AddPhotoModal
          title={place.kind === "bump" ? "A bump photo" : "The scan"}
          kind={place.kind === "bump" ? "bump" : "scan"}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </li>
  );
}

/** The places ready now, each said once, quietly. */
export function Places({ places }: { places: readonly Place[] }) {
  if (places.length === 0) return null;
  return (
    <ul aria-label="Ready for you" className="flex flex-col gap-3">
      {places.map((p) => (
        <PlaceReady key={p.key} place={p} />
      ))}
    </ul>
  );
}
