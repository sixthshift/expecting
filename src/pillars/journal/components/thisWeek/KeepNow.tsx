import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { aroundNow } from "../../../../lib/journal/firsts";
import { placesReady } from "../../../../lib/journal/places";
import { AroundNow } from "./firsts/AroundNow";
import { Places } from "./places/Places";

/**
 * What's worth keeping now, asked rather than looked for: the firsts that
 * usually come around now ("Has it happened yet?") and the places made ready
 * (a scan's picture, this week's bump photo). The Journal draws it above its
 * story; This week draws it with the check-in, as what to keep for the Journal.
 * Nothing until there's a due date.
 */
export function KeepNow() {
  const { data: settings } = useSettingsQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const now = useNow();
  const { dueDate } = settings;
  if (now === null || !dueDate) return null;
  return (
    <>
      <AroundNow week={now} around={aroundNow({ now, marks: firsts, knowing: settings.baby !== "unknown" })} />
      <Places places={placesReady({ now, photos, papers, dueDate })} />
    </>
  );
}
