import { Button } from "@sixthshift/design-system/button";
import { useState } from "react";
import { kindsOffered } from "../../../../../../lib/journal/quiet";
import type { QuietKind } from "../../../../../../lib/quiet";
import { AddPhotoModal } from "../../components/AddPhoto";

/**
 * The one quiet way to add a photo while something has happened: in the
 * photos' collection, where there's no bump row, no empty frame, no scrubber
 * and no side by side, and in what's folded away in the quiet Journal. Never
 * a bump after a loss (`kindsOffered`).
 */
export function QuietAddPhoto({ quiet }: { quiet: QuietKind | null }) {
  const [adding, setAdding] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setAdding(true)}>
        Add a photo
      </Button>
      {adding ? <AddPhotoModal title="Add a photo" kinds={kindsOffered(quiet)} onClose={() => setAdding(false)} /> : null}
    </>
  );
}
