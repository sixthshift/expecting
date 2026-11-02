import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { foldedWhileQuiet, storyGroups, storyMatches, weekTiles } from "../../../../lib/story";
import type { Week } from "../../../../lib/timeline";
import { useJournalPage, useJournalSearch } from "../../contexts/JournalPageContext";
import { LensView } from "../story/LensView";
import { StoryList } from "../story/Story";
import { LensBar, ZoomAndSearch } from "../story/StoryTools";
import { PregnancyZoom, WeeksZoom } from "../story/Zoom";

const route = getRouteApi("/app/journal");

/**
 * The quiet Journal's story: what stays (the notes, letters, feelings,
 * papers and what was done), newest first under the weeks that have
 * something in them, with no week's title (they're about the baby); in a
 * lens, zoomed out, or searched. No firsts on the pregnancy's line, no
 * recaps and no book.
 */
export function QuietStory() {
  const { quiet, items, lens, lenses } = useJournalPage();
  const { words, setWords } = useJournalSearch();
  const { zoom, at } = route.useSearch();
  const navigate = route.useNavigate();
  const { data: settings } = useSettingsQuery();
  const { data: people } = usePeopleQuery();
  const now = useNow();
  const { dueDate } = settings;

  // A week to open at: scrolled to, as the timeline's are.
  useEffect(() => {
    if (at !== undefined && !zoom) document.getElementById(`week-${at}`)?.scrollIntoView({ block: "start" });
  }, [at, zoom]);

  const shown = useMemo(() => items.filter((i) => !foldedWhileQuiet(i)), [items]);
  const name = (id: string | null) => (id === null ? null : (people.people.find((p) => p.id === id)?.name ?? null));
  const found = shown.filter((i) => storyMatches(i, words, name));
  const searching = words.trim().length > 0;
  const openWeek = (week: Week) => navigate({ search: { at: week } });

  return (
    <>
      <h2 className="font-display text-xl font-semibold text-fg-strong">The story so far</h2>
      <LensBar lens={lens} lenses={lenses} />

      {lens !== "all" ? (
        <LensView lens={lens} items={shown} quiet={quiet} />
      ) : (
        <section aria-label="The story" className="flex max-w-2xl flex-col gap-4">
          <ZoomAndSearch zoomable={Boolean(dueDate)} searchable={shown.length > 1} words={words} onWords={setWords} />
          {zoom === "weeks" && dueDate ? (
            <WeeksZoom tiles={weekTiles(shown, dueDate, now)} now={now} onOpen={openWeek} />
          ) : zoom === "pregnancy" && dueDate ? (
            <PregnancyZoom landmarks={[]} tiles={weekTiles(shown, dueDate, now)} now={now} onOpen={openWeek} />
          ) : searching ? (
            <>
              {found.length === 0 ? <p className="text-fg-subtle">Nothing kept has those words.</p> : null}
              <StoryList groups={storyGroups(found, dueDate)} titled={false} />
            </>
          ) : (
            <StoryList groups={storyGroups(shown, dueDate)} titled={false} />
          )}
        </section>
      )}
    </>
  );
}
