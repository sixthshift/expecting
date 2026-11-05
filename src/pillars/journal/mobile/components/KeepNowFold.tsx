import { useState } from "react";
import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { CollapsibleCard } from "../../../../components/CollapsibleCard";
import { aroundNow } from "../../../../lib/journal/firsts";
import { placesReady } from "../../../../lib/journal/places";
import { KeepNow } from "../../components/thisWeek/KeepNow";

/**
 * What's worth keeping now (`KeepNow`) folded to a line above the story on a
 * phone, so the story starts near the top: "To keep · The cot is up", opened
 * in place. Nothing when there's nothing to keep now.
 */
export function KeepNowFold() {
  const { data: settings } = useSettingsQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const around = aroundNow({ now, marks: firsts, knowing: settings.baby !== "unknown" });
  const places = placesReady({ now, photos, papers, dueDate: settings.dueDate });
  if (around.length + places.length === 0) return null;
  const summary = [...around.map((f) => f.title), ...(places.length > 0 ? [places.length === 1 ? "a place ready" : `${places.length} places ready`] : [])].join(
    " · "
  );
  return (
    <CollapsibleCard title="To keep" summary={summary} open={open} onToggle={() => setOpen((o) => !o)} className="bg-bg-warning-subtle">
      <KeepNow />
    </CollapsibleCard>
  );
}
