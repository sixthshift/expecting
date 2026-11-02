import { Button } from "@sixthshift/design-system/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useFirsts } from "../../../../../api/rpc/firsts";
import { usePeople } from "../../../../../api/rpc/people";
import { useNow, useSettings } from "../../../../../api/rpc/settings";
import { type RecapSpan, recapsSoFar } from "../../../../../lib/journalNow";
import { hasRecap } from "../../../../../lib/recap";
import { landmarks, type StoryItem, storyGroups, storyMatches, storySpine, weekTiles } from "../../../../../lib/story";
import type { Week } from "../../../../../lib/timeline";
import { useJournalPage, useJournalSearch } from "../../../contexts/JournalPageContext";
import { RecapViewer, useRecap } from "../../Recap";
import { LensView } from "../../story/LensView";
import { StoryList } from "../../story/Story";
import { LensBar, ZoomAndSearch } from "../../story/StoryTools";
import { PregnancyZoom, WeeksZoom } from "../../story/Zoom";

const route = getRouteApi("/app/journal");

/** A recap so far, opened from the whole pregnancy's line. */
function RecapButton({ span, items }: { span: RecapSpan; items: readonly StoryItem[] }) {
  const recap = useRecap(span, items);
  const [open, setOpen] = useState(false);
  if (!recap || !hasRecap(recap)) return null;
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {span.title}, kept
      </Button>
      {open ? <RecapViewer recap={recap} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/**
 * The story so far: everything kept and done, newest first under its week
 * and day, in a lens (`?show=`), zoomed out (`?zoom=`), or searched with
 * words (the page's context holds them, as the week so far hides its days
 * while they're looked through). `?at=28` opens it at a week. Every week is
 * on its spine, with its title. The quiet Journal's story is its own
 * (`QuietStory`).
 */
export function StorySoFar() {
  const { words, setWords } = useJournalSearch();
  const { items, lens, lenses } = useJournalPage();
  const { zoom, at } = route.useSearch();
  const navigate = route.useNavigate();
  const { data: settings } = useSettings();
  const { data: people } = usePeople();
  const { data: firsts } = useFirsts();
  const now = useNow();
  const { dueDate } = settings;

  // A week to open at: scrolled to, as the timeline's are.
  useEffect(() => {
    if (at !== undefined && !zoom) document.getElementById(`week-${at}`)?.scrollIntoView({ block: "start" });
  }, [at, zoom]);

  const name = (id: string | null) => (id === null ? null : (people.people.find((p) => p.id === id)?.name ?? null));
  const found = items.filter((i) => storyMatches(i, words, name));
  const searching = words.trim().length > 0;
  const openWeek = (week: Week) => navigate({ search: { at: week } });

  return (
    <>
      <h2 className="font-display text-xl font-semibold text-fg-strong">The story so far</h2>
      <LensBar lens={lens} lenses={lenses} />

      {lens !== "all" ? (
        <LensView lens={lens} items={items} quiet={null} />
      ) : (
        <section aria-label="The story" className="flex max-w-2xl flex-col gap-4">
          <ZoomAndSearch zoomable={Boolean(dueDate)} searchable={items.length > 1} words={words} onWords={setWords} />
          {zoom === "weeks" && dueDate ? (
            <WeeksZoom tiles={weekTiles(items, dueDate, now)} now={now} onOpen={openWeek} />
          ) : zoom === "pregnancy" && dueDate ? (
            <>
              <PregnancyZoom landmarks={landmarks(firsts, dueDate)} tiles={weekTiles(items, dueDate, now)} now={now} onOpen={openWeek} />
              <div className="flex flex-wrap items-center gap-2">
                {recapsSoFar(now).map((span) => (
                  <RecapButton key={span.key} span={span} items={items} />
                ))}
                <Link to="/journal/book" className="flex min-h-9 items-center px-2 text-sm font-medium text-fg-brand underline">
                  The book
                </Link>
              </div>
            </>
          ) : searching ? (
            <>
              {found.length === 0 ? <p className="text-fg-subtle">Nothing kept has those words.</p> : null}
              <StoryList groups={storyGroups(found, dueDate)} />
            </>
          ) : (
            <StoryList groups={storySpine(items, dueDate, now, now)} />
          )}
        </section>
      )}
    </>
  );
}
