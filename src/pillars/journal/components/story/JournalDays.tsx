import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import type { ChapterLine } from "../../../../lib/chapters";
import { alreadyHappened, aroundNow } from "../../../../lib/firsts";
import { placesReady } from "../../../../lib/places";
import type { StoryItem } from "../../../../lib/story/items";
import { storySpine } from "../../../../lib/story/spine";
import { BookCover } from "../book/BookCover";
import { StoryList } from "../lines/StoryList";
import { AlreadyHappened, AroundNow, Places } from "../thisWeek/KeepNow";

/**
 * The story in days, as the Journal opens: what's to keep now (the firsts
 * around now, the places made ready, what's already happened); the book's
 * cover while it's young (`cover`); then every week on the spine, this one
 * first.
 */
export function JournalDays({ items, cover }: { items: readonly StoryItem[]; cover: readonly ChapterLine[] | null }) {
  const { data: settings } = useSettingsQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const now = useNow();
  const { dueDate } = settings;
  const knowing = settings.baby !== "unknown";
  return (
    <>
      {now !== null && dueDate ? (
        <>
          <AroundNow week={now} around={aroundNow({ now, marks: firsts, knowing, quiet: false })} />
          <Places places={placesReady({ now, photos, papers, dueDate, quiet: false })} />
          <AlreadyHappened firsts={alreadyHappened({ now, marks: firsts, knowing, quiet: false })} week={now} />
        </>
      ) : null}
      {cover ? <BookCover lines={cover} /> : null}
      <StoryList groups={storySpine(items, dueDate, now)} />
    </>
  );
}
