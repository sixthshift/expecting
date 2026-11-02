import { isKindView } from "../../../../lib/story/views";
import { useJournalPage } from "../../contexts/JournalPageContext";
import { useBook } from "../../hooks/useBook";
import { useScrollToWeek } from "../../hooks/useScrollToWeek";
import { useStorySearch } from "../../hooks/useStorySearch";
import { useStoryView } from "../../hooks/useStoryView";
import { KindView } from "../story/KindView";
import { SearchResults } from "../story/SearchResults";
import { StoryControls } from "../story/StoryTools";
import { PregnancyView, WeeksView } from "../story/Zoom";
import { JournalDays } from "./JournalDays";
import { Recaps } from "./Recaps";
import { BookLine } from "./thisWeek/BookCover";
import { Calls } from "./thisWeek/Calls";

/**
 * The Journal: one story, newest first. A call to make, if there is one,
 * above everything; the book's line once it's under way; the ways to look
 * at the story and the search; then the story as it's looked at: what a
 * search found, zoomed out to weeks or the whole pregnancy (with the
 * recaps), one kind, or in days (`JournalDays`, opening on this week). The
 * quiet Journal's story is its own (`QuietStory`).
 */
export function JournalStory() {
  const { items } = useJournalPage();
  const { view, views, open } = useStoryView(items, { quiet: false });
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
        ) : isKindView(view) ? (
          <KindView kind={view} items={items} quiet={null} />
        ) : (
          <JournalDays items={items} cover={book.cover ? book.chapters : null} />
        )}
      </section>
    </>
  );
}
