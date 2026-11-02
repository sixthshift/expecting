import { Button } from "@sixthshift/design-system/button";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useNow, useSettingsQuery } from "../../../../api/rpc/settings";
import { contents, young } from "../../../../lib/chapters";
import { alreadyHappened, aroundNow } from "../../../../lib/firsts";
import { type RecapSpan, recapsSoFar } from "../../../../lib/journalNow";
import { placesReady } from "../../../../lib/places";
import { hasRecap } from "../../../../lib/recap";
import { inWeek, landmarks, type StoryItem, storyGroups, storyMatches, storySpine, weekTiles } from "../../../../lib/story";
import type { Week } from "../../../../lib/timeline";
import { useJournalPage } from "../../contexts/JournalPageContext";
import { useLens } from "../../hooks/useLens";
import { RecapViewer, useRecap } from "../Recap";
import { LensView } from "../story/LensView";
import { StoryList } from "../story/Story";
import { StoryControls } from "../story/StoryTools";
import { PregnancyZoom, WeeksZoom } from "../story/Zoom";
import { BookCover, BookLine } from "./thisWeek/BookCover";
import { Calls } from "./thisWeek/Calls";
import { AlreadyHappened, Places, WeekPage } from "./thisWeek/WeekPage";

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
 * The Journal: one story, newest first. A call to make, if there is one,
 * above everything; then the lenses, the zoom and the search. Plain (all of
 * it, not zoomed, not searched), it opens on this week as its own page (the
 * week, the firsts around now, its days, the places made
 * ready, what's already happened), then every week before it on the
 * spine, with its title. In a lens (`?show=`), zoomed out (`?zoom=`) or
 * searched, that is the story instead. `?at=28` opens it at a week. The
 * book: a cover while the Journal is young, one line at the top after. The
 * quiet Journal's story is its own (`QuietStory`).
 */
export function JournalStory() {
  const [words, setWords] = useState("");
  const { items } = useJournalPage();
  const { lens, lenses } = useLens(items, false);
  const { zoom, at } = route.useSearch();
  const navigate = route.useNavigate();
  const { data: settings } = useSettingsQuery();
  const { data: people } = usePeopleQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const now = useNow();
  const { dueDate } = settings;
  const knowing = settings.baby !== "unknown";

  // A week to open at: scrolled to, as the timeline's are.
  useEffect(() => {
    if (at !== undefined && !zoom) document.getElementById(`week-${at}`)?.scrollIntoView({ block: "start" });
  }, [at, zoom]);

  const name = (id: string | null) => (id === null ? null : (people.people.find((p) => p.id === id)?.name ?? null));
  const found = items.filter((i) => storyMatches(i, words, name));
  const searching = words.trim().length > 0;
  const openWeek = (week: Week) => navigate({ search: { at: week } });
  const chapters = contents({ items, dueDate, now });
  // The book, while the Journal is young (or there's no due date to write its weeks in), on the page; after, one line at the top.
  const book = !dueDate || young(items) ? "cover" : "line";

  return (
    <>
      <Calls />
      {book === "line" ? <BookLine lines={chapters} /> : null}
      <StoryControls lenses={lenses} zoomable={Boolean(dueDate)} searchable={items.length > 1} words={words} onWords={setWords} />

      {lens !== "all" ? (
        <LensView lens={lens} items={items} quiet={null} />
      ) : (
        <section aria-label="The story" className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-4">
              {found.length === 0 ? <p className="text-fg-subtle">Nothing kept has those words.</p> : null}
              <StoryList groups={storyGroups(found, dueDate)} />
            </div>
          ) : (
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
              {book === "cover" ? <BookCover lines={chapters} /> : null}
              <StoryList groups={storySpine(items, dueDate, now, now)} />
            </>
          )}
        </section>
      )}
    </>
  );
}
