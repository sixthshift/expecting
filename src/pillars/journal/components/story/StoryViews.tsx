import type { ReactNode } from "react";
import type { StoryItem } from "../../../../lib/journal/story/items";
import { useScrollToWeek } from "../../hooks/useScrollToWeek";
import { useStorySearch } from "../../hooks/useStorySearch";
import { useStoryView } from "../../hooks/useStoryView";
import { SearchResults } from "./SearchResults";
import { StoryControls } from "./StoryControls";
import { WeeksView } from "./views/weeks/WeeksView";

/**
 * The story as it's looked at, under the ways to look at it and the search:
 * what a search found, zoomed out to weeks, the whole pregnancy
 * (`pregnancy`), or in days (`days`). Drawn by both stories, the Journal's
 * and the quiet one, each giving its own whole pregnancy and days; `titled`
 * false leaves out the weeks' titles (the quiet Journal).
 */
export function StoryViews({
  items,
  titled,
  pregnancy,
  days,
  className,
}: {
  items: readonly StoryItem[];
  titled: boolean;
  pregnancy: ReactNode;
  days: ReactNode;
  className: string;
}) {
  const { view, views, open } = useStoryView();
  const search = useStorySearch(items, () => open("days"));
  useScrollToWeek();
  return (
    <>
      <StoryControls views={views} view={view} onView={open} searchable={items.length > 1} words={search.words} onWords={search.look} />
      <section aria-label="The story" className={className}>
        {search.searching ? (
          <SearchResults found={search.found} titled={titled} />
        ) : view === "weeks" ? (
          <WeeksView items={items} />
        ) : view === "pregnancy" ? (
          pregnancy
        ) : (
          days
        )}
      </section>
    </>
  );
}
