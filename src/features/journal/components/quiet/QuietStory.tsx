import { useMemo } from "react";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { foldedWhileQuiet } from "../../../../lib/story/items";
import { storyGroups } from "../../../../lib/story/spine";
import { isKindView } from "../../../../lib/story/views";
import { useJournalPage } from "../../contexts/JournalPageContext";
import { useScrollToWeek } from "../../hooks/useScrollToWeek";
import { useStorySearch } from "../../hooks/useStorySearch";
import { useStoryView } from "../../hooks/useStoryView";
import { StoryList } from "../lines/StoryList";
import { KindView } from "../story/KindView";
import { SearchResults } from "../story/SearchResults";
import { StoryControls } from "../story/StoryTools";
import { PregnancyView, WeeksView } from "../story/Zoom";

/**
 * The quiet Journal's story: what stays (the notes, letters, feelings,
 * papers and what was done), newest first under the weeks that have
 * something in them, with no week's title (they're about the baby);
 * looked at the same ways as the Journal's, and searched. No firsts on the
 * pregnancy's line, no recaps and no book.
 */
export function QuietStory() {
  const { quiet, items } = useJournalPage();
  const shown = useMemo(() => items.filter((i) => !foldedWhileQuiet(i)), [items]);
  const { view, views, open } = useStoryView(shown, { quiet: true });
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
        ) : isKindView(view) ? (
          <KindView kind={view} items={shown} quiet={quiet} />
        ) : (
          <StoryList groups={storyGroups(shown, dueDate)} titled={false} />
        )}
      </section>
    </>
  );
}
