import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { useLayout } from "../../../../app/hooks/useLayout";
import type { ChapterLine } from "../../../../lib/journal/chapters";
import { alreadyHappened } from "../../../../lib/journal/firsts";
import type { StoryItem } from "../../../../lib/journal/story/items";
import { storySpine } from "../../../../lib/journal/story/spine";
import { KeepNowFold } from "../../mobile/components/KeepNowFold";
import { BookCover } from "../book/BookCover";
import { StoryList } from "../lines/StoryList";
import { AlreadyHappened } from "../thisWeek/firsts/AlreadyHappened";
import { KeepNow } from "../thisWeek/KeepNow";

/**
 * The story in days, as the Journal opens: what's to keep now (`KeepNow`:
 * the firsts around now, the places made ready; then what's already happened); the book's
 * cover while it's young (`cover`); then every week on the spine, this one
 * first. On a desktop each day has a margin for its marks; on a phone
 * what's to keep now is folded to a line (`KeepNowFold`).
 */
export function JournalDays({ items, cover }: { items: readonly StoryItem[]; cover: readonly ChapterLine[] | null }) {
  const { data: settings } = useSettingsQuery();
  const { data: firsts } = useFirstsQuery();
  const now = useNow();
  const desktop = useLayout() === "desktop";
  const { dueDate } = settings;
  const knowing = settings.baby !== "unknown";
  return (
    <>
      {now !== null && dueDate ? (
        <>
          {desktop ? <KeepNow /> : <KeepNowFold />}
          <AlreadyHappened firsts={alreadyHappened({ now, marks: firsts, knowing })} week={now} />
        </>
      ) : null}
      {cover ? <BookCover lines={cover} /> : null}
      <StoryList groups={storySpine(items, dueDate, now)} margin={desktop} />
    </>
  );
}
