import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import type { ChapterLine } from "../../../../lib/journal/chapters";
import { alreadyHappened, aroundNow } from "../../../../lib/journal/firsts";
import { placesReady } from "../../../../lib/journal/places";
import type { StoryItem } from "../../../../lib/journal/story/items";
import { storySpine } from "../../../../lib/journal/story/spine";
import { BookCover } from "../book/BookCover";
import { StoryList } from "../lines/StoryList";
import { AlreadyHappened } from "../thisWeek/firsts/AlreadyHappened";
import { AroundNow } from "../thisWeek/firsts/AroundNow";
import { Places } from "../thisWeek/places/Places";

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
          <AroundNow week={now} around={aroundNow({ now, marks: firsts, knowing })} />
          <Places places={placesReady({ now, photos, papers, dueDate })} />
          <AlreadyHappened firsts={alreadyHappened({ now, marks: firsts, knowing })} week={now} />
        </>
      ) : null}
      {cover ? <BookCover lines={cover} /> : null}
      <StoryList groups={storySpine(items, dueDate, now)} />
    </>
  );
}
