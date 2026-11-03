import { Button } from "@sixthshift/design-system/button";

/**
 * The photos while something has happened, drawn only inside the Journal's
 * fold: plain, the album by week and one way to add a photo. No bump row, no
 * empty frame, no scrubber, no side by side. The album is `PhotosCollection`'s.
 */
export function QuietPhotosCollection({ onAdd }: { onAdd: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="self-start" onClick={onAdd}>
      Add a photo
    </Button>
  );
}
