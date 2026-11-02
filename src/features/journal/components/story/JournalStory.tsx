import { useJournalPage } from "../../contexts/JournalPageContext";
import { useBook } from "../../hooks/useBook";
import { useScrollToWeek } from "../../hooks/useScrollToWeek";
import { useStorySearch } from "../../hooks/useStorySearch";
import { useStoryView } from "../../hooks/useStoryView";
import { BookLine } from "../book/BookCover";
import { Recaps } from "../book/Recaps";
import { Calls } from "../thisWeek/Calls";
import { JournalDays } from "./JournalDays";
import { SearchResults } from "./SearchResults";
import { StoryControls } from "./StoryControls";
import { PregnancyView, WeeksView } from "./views/ZoomedOut";

/**
 * The Journal: one story, newest first. A call to make, if there is one,
 * above everything; the book's line once it's under way; the ways to look
 * at the story and the search; then the story as it's looked at: what a
 * search found, zoomed out to weeks or the whole pregnancy (with the
 * recaps), or in days (`JournalDays`, opening on this week). The
 * quiet Journal's story is its own (`QuietStory`).
 */
export function JournalStory() {
  const { items } = useJournalPage();
  const { view, views, open } = useStoryView();
  const search = useStorySearch(items, () => open("days"));
  const book = useBook(items);
  useScrollToWeek();

  return (
    <>
      <Calls />
      {book.cover ? null : <BookLine lines={book.chapters} />}
      <StoryControls views={views} view={view} onView={open} searchable={items.length > 1} words={search.words} onWords={search.look} />
      <section aria-label="The story" className="flex flex-col gap-6">
        {search.searching ? (
          <SearchResults found={search.found} />
        ) : view === "weeks" ? (
          <WeeksView items={items} />
        ) : view === "pregnancy" ? (
          <>
            <PregnancyView items={items} withFirsts />
            <Recaps items={items} />
          </>
        ) : (
          <JournalDays items={items} cover={book.cover ? book.chapters : null} />
        )}
      </section>
    </>
  );
}
