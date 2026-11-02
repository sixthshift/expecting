import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useFirsts } from "../../../../../api/rpc/firsts";
import { usePeople } from "../../../../../api/rpc/people";
import { useQuiet } from "../../../../../api/rpc/quiet";
import { useNow, useSettings } from "../../../../../api/rpc/settings";
import { type RecapSpan, recapsSoFar } from "../../../../../lib/journalNow";
import { kindsOffered } from "../../../../../lib/photos";
import { hasRecap } from "../../../../../lib/recap";
import { foldedWhileQuiet, LENS_LABEL, type Lens, landmarks, type StoryItem, storyGroups, storyMatches, storySpine, weekTiles } from "../../../../../lib/story";
import type { Week } from "../../../../../lib/timeline";
import { useJournalSearch } from "../../../hooks/useJournalPage";
import { useLens } from "../../../hooks/useLens";
import { useStory } from "../../../hooks/useStory";
import { AddPhoto } from "../../entries/photos/AddPhoto";
import { RecapViewer, useRecap } from "../../Recap";
import { StoryList } from "../Story";
import { LensView } from "./LensView";
import { PregnancyZoom, WeeksZoom } from "./Zoom";

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

/** While something has happened: what's folded away, behind one quiet line, with one quiet way to add a photo. */
function KeptBefore({ items }: { items: readonly StoryItem[] }) {
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="self-start text-fg-subtle" onClick={() => setOpen(true)}>
        What you kept before
      </Button>
    );
  }
  return (
    <section aria-label="What you kept before" className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setAdding(true)}>
        Add a photo
      </Button>
      {items.length > 0 ? <StoryList groups={storyGroups(items, settings.dueDate)} label="What you kept before" /> : null}
      {adding ? (
        <Modal size="sm" align="top" closable onOpenChange={(o) => (o ? null : setAdding(false))} aria-label="Add a photo">
          <Modal.Header>
            <h2 className="font-display text-lg font-semibold text-fg-strong">Add a photo</h2>
          </Modal.Header>
          <Modal.Body className="px-6 pb-6">
            <AddPhoto kinds={kindsOffered(quiet?.kind ?? null)} onAdded={() => setAdding(false)} />
          </Modal.Body>
        </Modal>
      ) : null}
    </section>
  );
}

/**
 * The story so far: everything kept and done, newest first under its week
 * and day, in a lens (`?show=`), zoomed out (`?zoom=`), or searched with
 * words (the page's context holds them, as the week so far hides its days
 * while they're looked through). `?at=28` opens it at a week. While something has
 * happened, what's folded away waits behind one quiet line.
 */
export function StorySoFar() {
  const { words, setWords } = useJournalSearch();
  const items = useStory();
  const { zoom, at } = route.useSearch();
  const navigate = route.useNavigate();
  const { lens, lenses } = useLens();
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  const { data: people } = usePeople();
  const { data: firsts } = useFirsts();
  const now = useNow();
  const isQuiet = Boolean(quiet);
  const { dueDate } = settings;

  // A week to open at: scrolled to, as the timeline's are.
  useEffect(() => {
    if (at !== undefined && !zoom) document.getElementById(`week-${at}`)?.scrollIntoView({ block: "start" });
  }, [at, zoom]);

  const shown = isQuiet ? items.filter((i) => !foldedWhileQuiet(i)) : items;
  const folded = isQuiet ? items.filter(foldedWhileQuiet) : [];
  const name = (id: string | null) => (id === null ? null : (people.people.find((p) => p.id === id)?.name ?? null));
  const found = shown.filter((i) => storyMatches(i, words, name));
  const searching = words.trim().length > 0;
  const openWeek = (week: Week) => navigate({ search: { at: week } });

  return (
    <>
      <h2 className="font-display text-xl font-semibold text-fg-strong">The story so far</h2>
      {lenses.length > 1 ? (
        <ToggleGroup
          type="single"
          appearance="separate"
          variant="outline"
          size="sm"
          aria-label="Show"
          className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
          value={lens}
          onValueChange={(value) => navigate({ search: { show: value && value !== "all" ? (value as Lens) : undefined } })}
          options={lenses.map((l) => ({ value: l, label: LENS_LABEL[l] }))}
        />
      ) : null}

      {lens !== "all" ? (
        <LensView lens={lens} items={shown} />
      ) : (
        <section aria-label="The story" className="flex max-w-2xl flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {dueDate ? (
              <ToggleGroup
                type="single"
                appearance="separate"
                variant="ghost"
                size="sm"
                aria-label="Zoom"
                value={zoom ?? "days"}
                onValueChange={(value) => navigate({ search: { zoom: value === "weeks" || value === "pregnancy" ? value : undefined } })}
                options={[
                  { value: "days", label: "Days" },
                  { value: "weeks", label: "Weeks" },
                  { value: "pregnancy", label: "Pregnancy" },
                ]}
              />
            ) : null}
            {!zoom && shown.length > 1 ? (
              <div className="min-w-48 flex-1">
                {/* Words held on the page, not in the address: what you look for is yours. */}
                <SearchInput value={words} onValueChange={setWords} placeholder="Look through what's kept" aria-label="Search the Journal" />
              </div>
            ) : null}
          </div>
          {zoom === "weeks" && dueDate ? (
            <WeeksZoom tiles={weekTiles(shown, dueDate, now)} now={now} onOpen={openWeek} />
          ) : zoom === "pregnancy" && dueDate ? (
            <>
              <PregnancyZoom landmarks={landmarks(isQuiet ? [] : firsts, dueDate)} tiles={weekTiles(shown, dueDate, now)} now={now} onOpen={openWeek} />
              {isQuiet ? null : (
                <div className="flex flex-wrap items-center gap-2">
                  {recapsSoFar(now).map((span) => (
                    <RecapButton key={span.key} span={span} items={items} />
                  ))}
                  <Link to="/journal/book" className="flex min-h-9 items-center px-2 text-sm font-medium text-fg-brand underline">
                    The book
                  </Link>
                </div>
              )}
            </>
          ) : searching ? (
            <>
              {found.length === 0 ? <p className="text-fg-subtle">Nothing kept has those words.</p> : null}
              <StoryList groups={storyGroups(found, dueDate)} />
            </>
          ) : (
            // While something has happened, only the weeks with something in them: a quiet week's title is about the baby.
            <StoryList groups={isQuiet ? storyGroups(shown, dueDate) : storySpine(shown, dueDate, now, now)} />
          )}
        </section>
      )}
      {isQuiet && folded.length > 0 ? <KeptBefore items={folded} /> : null}
    </>
  );
}
