import { useLayout } from "../../../../app/hooks/useLayout";
import { useJournalPage } from "../../contexts/JournalPageContext";
import { useBook } from "../../hooks/useBook";
import { BookLine } from "../book/BookCover";
import { Recaps } from "../book/Recaps";
import { Calls } from "../thisWeek/Calls";
import { JournalDays } from "./JournalDays";
import { StoryViews } from "./StoryViews";
import { PregnancyView } from "./views/pregnancy/PregnancyView";

/**
 * The Journal: one story, newest first. A call to make, if there is one,
 * above everything; the book's line once it's under way; then the story as
 * it's looked at (`StoryViews`): zoomed out to the whole pregnancy with the
 * recaps, or in days (`JournalDays`, opening on this week). The quiet
 * Journal's story is its own (`QuietStory`).
 */
export function JournalStory() {
  const { items } = useJournalPage();
  const book = useBook(items);
  // On a phone the book is a tab of its own; on a desktop its line is above the story's tools.
  const phone = useLayout() === "mobile";

  return (
    <>
      <Calls />
      {book.cover || phone ? null : <BookLine lines={book.chapters} />}
      <StoryViews
        items={items}
        titled
        className="flex flex-col gap-6"
        pregnancy={
          <>
            <PregnancyView items={items} withFirsts />
            <Recaps items={items} />
          </>
        }
        days={<JournalDays items={items} cover={book.cover ? book.chapters : null} />}
      />
    </>
  );
}
