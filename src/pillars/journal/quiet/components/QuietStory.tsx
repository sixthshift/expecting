import { useSettingsQuery } from "../../../../api/rpc/settings";
import { storyGroups } from "../../../../lib/journal/story/spine";
import { StoryList } from "../../components/lines/StoryList";
import { SearchResults } from "../../components/story/SearchResults";
import { StoryControls } from "../../components/story/StoryControls";
import { PregnancyView } from "../../components/story/views/pregnancy/PregnancyView";
import { WeeksView } from "../../components/story/views/weeks/WeeksView";
import { useScrollToWeek } from "../../hooks/useScrollToWeek";
import { useStorySearch } from "../../hooks/useStorySearch";
import { useStoryView } from "../../hooks/useStoryView";
import { useQuietJournalPage } from "../contexts/QuietJournalPageContext";

/**
 * The quiet Journal's story: what stays (the notes, letters, feelings,
 * papers and what was done), newest first under the weeks that have
 * something in them, with no week's title (they're about the baby);
 * looked at the same ways as the Journal's, and searched; by what it is, the collections. No firsts on the
 * pregnancy's line, no recaps and no book.
 */
export function QuietStory() {
  const { shown } = useQuietJournalPage();
  const { view, views, open } = useStoryView();
  const search = useStorySearch(shown, () => open("days"));
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  useScrollToWeek();

  return (
    <>
      <h2 className="font-display text-xl font-semibold text-fg-strong">The story so far</h2>
      <StoryControls views={views} view={view} onView={open} searchable={shown.length > 1} words={search.words} onWords={search.look} />
      <section aria-label="The story" className="flex flex-col gap-4">
        {search.searching ? (
          <SearchResults found={search.found} titled={false} />
        ) : view === "weeks" ? (
          <WeeksView items={shown} />
        ) : view === "pregnancy" ? (
          <PregnancyView items={shown} withFirsts={false} />
        ) : (
          <StoryList groups={storyGroups(shown, dueDate)} titled={false} />
        )}
      </section>
    </>
  );
}
