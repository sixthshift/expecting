// The places Expecting has made ready now, above the story.

import type { Place } from "../../../../../lib/journal/places";
import { PlaceReady } from "./PlaceReady";

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
