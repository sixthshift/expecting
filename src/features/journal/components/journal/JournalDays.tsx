import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import type { ChapterLine } from "../../../../lib/chapters";
import { alreadyHappened, aroundNow } from "../../../../lib/firsts";
import { placesReady } from "../../../../lib/places";
import type { StoryItem } from "../../../../lib/story/items";
import { inWeek, storyGroups, storySpine } from "../../../../lib/story/spine";
import { StoryList } from "../lines/StoryList";
import { BookCover } from "./thisWeek/BookCover";
import { AlreadyHappened, Places, WeekPage } from "./thisWeek/WeekPage";

/**
 * The story in days, as the Journal opens: this week as its own page (the
 * week, the firsts around now, what's kept this week), the places made
 * ready, what's already happened that can still be kept; the book's cover
 * while it's young (`cover`); then every week before this one on the spine.
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
          <WeekPage
            week={now}
            around={aroundNow({ now, marks: firsts, knowing, quiet: false })}
            days={storyGroups(inWeek(items, now, dueDate), dueDate).flatMap((g) => (g.kind === "group" ? g.days : []))}
          />
          <Places places={placesReady({ now, photos, papers, dueDate, quiet: false })} />
          <AlreadyHappened firsts={alreadyHappened({ now, marks: firsts, knowing, quiet: false })} week={now} />
        </>
      ) : null}
      {cover ? <BookCover lines={cover} /> : null}
      <StoryList groups={storySpine(items, dueDate, now, now)} />
    </>
  );
}
