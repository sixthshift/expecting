import { Button } from "@sixthshift/design-system/button";
import { Modal } from "@sixthshift/design-system/modal";
import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppetite } from "../../../api/rpc/appetite";
import { useChecklist } from "../../../api/rpc/checklist";
import { useFeelings } from "../../../api/rpc/feelings";
import { useFirsts } from "../../../api/rpc/firsts";
import { journalSeenSaves, useJournal, useJournalSeen } from "../../../api/rpc/journal";
import { usePeople } from "../../../api/rpc/people";
import { usePhotos } from "../../../api/rpc/photos";
import { useQuiet } from "../../../api/rpc/quiet";
import { useNow, usePosition, useSettings } from "../../../api/rpc/settings";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { useSave } from "../../../app/hooks/useSave";
import { todayISO } from "../../../lib/dates";
import { aroundNow, stillToCome, suggestFirsts } from "../../../lib/firsts";
import { nowCards, type RecapSpan, recapsSoFar } from "../../../lib/journalNow";
import { kindsOffered } from "../../../lib/photos";
import { hasRecap } from "../../../lib/recap";
import {
  foldedWhileQuiet,
  inWeek,
  LENS_LABEL,
  type Lens,
  landmarks,
  lensesKept,
  patternsKept,
  type StoryItem,
  storyGroups,
  storyMatches,
  storySpine,
  weekTiles,
} from "../../../lib/story";
import type { Week } from "../../../lib/timeline";
import { FeelingsLens } from "../../feelings/components/history/Feelings";
import { AppetiteLens } from "../components/appetite/appetite";
import { FirstsLens } from "../components/firsts/firsts";
import { KeepRow } from "../components/keep/KeepRow";
import { Lately } from "../components/lately/Lately";
import { MovementsLens } from "../components/movements/movements";
import { Calls, NowCards } from "../components/now/Now";
import { PapersLens } from "../components/papers/papers";
import { AddPhoto } from "../components/photos/AddPhoto";
import { PhotosLens } from "../components/photos/photos";
import { RecapViewer, useRecap } from "../components/recap/Recap";
import { StoryList } from "../components/story/Story";
import { PregnancyZoom, WeeksZoom } from "../components/story/Zoom";
import { StillToCome, WeekPage } from "../components/week/WeekPage";
import { useOnThisPhone } from "../hooks/useOnThisPhone";
import { useStory } from "../hooks/useStory";

const route = getRouteApi("/app/journal");

/** What the "+" just kept, by its id (a first by its key), as a line of the story. */
function keptLine(items: readonly StoryItem[], id: string | undefined): StoryItem | null {
  if (!id) return null;
  return items.find((i) => i.key === id || i.key === `first-${id}` || (i.kind === "movements" && i.entries.some((e) => e.id === id))) ?? null;
}

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

/** One kind, at full size: its pattern, its tools, then each. */
function LensView({ lens, items }: { lens: Exclude<Lens, "all">; items: readonly StoryItem[] }) {
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  switch (lens) {
    case "notes":
      return (
        <section aria-labelledby="notes" className="flex max-w-2xl flex-col gap-4">
          <h2 id="notes" className="font-display text-lg font-semibold text-fg-strong">
            Notes and letters
          </h2>
          <StoryList
            groups={storyGroups(
              items.filter((i) => i.kind === "note" || i.kind === "letter"),
              settings.dueDate
            )}
            label="Your notes"
          />
        </section>
      );
    case "movements":
      return <MovementsLens />;
    case "appetite":
      return <AppetiteLens />;
    case "photos":
      return <PhotosLens quiet={null} />;
    case "feelings":
      return <FeelingsLens />;
    case "papers":
      return <PapersLens quiet={quiet?.kind ?? null} />;
    case "firsts":
      return <FirstsLens />;
  }
}

/**
 * The Journal: the pregnancy, kept and given back. What matters now first
 * (a call to make, what you just kept, what the other kept since you looked,
 * a first to claim, a recap, last week, this day weeks ago), the patterns
 * there's enough for, then the story: everything kept and done, newest first
 * under its week and day, in a lens, searched, or zoomed out to weeks or the
 * whole pregnancy. Adding is the "+" and the Keep row. It shows what's kept,
 * never what's missing. While something has happened, the notes, letters,
 * feelings, papers and what was done stay, and the rest is folded behind one
 * quiet line. See docs/plan-journal.md.
 */
export function JournalPage() {
  const { show, zoom, at, kept } = route.useSearch();
  const navigate = route.useNavigate();
  const items = useStory();
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  const { data: people } = usePeople();
  const { data: journal } = useJournal();
  const { data: appetite } = useAppetite();
  const { data: feelings } = useFeelings();
  const { data: photos } = usePhotos();
  const { data: firsts } = useFirsts();
  const { data: checklist } = useChecklist();
  const { data: seen } = useJournalSeen();
  const position = usePosition();
  const now = useNow();
  const markSeen = useSave(journalSeenSaves.markJournalSeen);
  // When you last looked, as it was when you came in: this visit marks it, and the card stays for this visit.
  const [lastSeen] = useState(seen);
  const [words, setWords] = useState("");
  const [opened, setOpened] = useOnThisPhone("expecting:recaps-opened");
  const today = todayISO();
  const isQuiet = Boolean(quiet);
  const { dueDate } = settings;

  // Once a visit, for whoever's holding the phone: `markSeen` is a new function each render.
  const me = people.me?.id;
  // biome-ignore lint/correctness/useExhaustiveDependencies: marked once as the page opens (and as who's holding it changes), not on every render.
  useEffect(() => {
    if (me) markSeen(undefined);
  }, [me]);

  // A week to open at: scrolled to, as the timeline's are.
  useEffect(() => {
    if (at !== undefined && !zoom) document.getElementById(`week-${at}`)?.scrollIntoView({ block: "start" });
  }, [at, zoom]);

  const shown = isQuiet ? items.filter((i) => !foldedWhileQuiet(i)) : items;
  const folded = isQuiet ? items.filter(foldedWhileQuiet) : [];
  const lenses = lensesKept(items, isQuiet);
  const lens: Lens = show && lenses.includes(show) ? show : "all";
  const cards = nowCards({
    items,
    kept: keptLine(items, kept),
    seen: lastSeen,
    me: people.me,
    people: people.people,
    suggestions: suggestFirsts({ marks: firsts, journal, photos, appetite, ticks: checklist.ticks, people: people.people, quiet: isQuiet }),
    today,
    position,
    dueDate,
    quiet: isQuiet,
    recapsOpened: opened,
  });
  const patterns = patternsKept({ journal, appetite, feelings, photos, today, dueDate, me: people.me?.id ?? null, quiet: isQuiet });
  const name = (id: string | null) => (id === null ? null : (people.people.find((p) => p.id === id)?.name ?? null));
  const found = shown.filter((i) => storyMatches(i, words, name));
  const openWeek = (week: Week) => navigate({ search: { at: week } });
  const knowing = settings.baby !== "unknown";
  // A first suggested from what's kept is asked on Now, with its day; around now asks the rest.
  const suggested = new Set(cards.flatMap((c) => (c.kind === "first" ? [c.suggestion.key] : [])));
  const around = aroundNow({ now, marks: firsts, knowing, quiet: isQuiet }).filter((f) => !suggested.has(f.key));
  const toCome = stillToCome({ now, marks: firsts, knowing, quiet: isQuiet });
  const searching = words.trim().length > 0;
  const thisWeek = now !== null && dueDate && lens === "all" && !zoom && !isQuiet ? storyGroups(inWeek(shown, now, dueDate), dueDate) : [];
  const thisWeekDays = thisWeek.flatMap((g) => (g.kind === "group" ? g.days : []));

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Journal" />
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_1fr] lg:gap-x-10">
        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <Calls />
          {/* While something has happened, no week counted and nothing about the baby: the story, as kept. */}
          {now !== null && dueDate && !isQuiet ? (
            <WeekPage week={now} quiet={isQuiet} around={around} days={searching ? [] : thisWeekDays} keep={<KeepRow />} />
          ) : (
            <KeepRow />
          )}
          <StillToCome firsts={toCome} />
        </div>

        <aside
          aria-label="Now and lately"
          className="flex flex-col gap-4 empty:hidden lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        >
          <NowCards cards={cards} items={items} onRecapOpened={setOpened} />
          <Lately patterns={patterns} onOpen={(l) => navigate({ search: { show: l } })} />
        </aside>

        <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-2">
          <h2 className="font-display text-xl font-semibold text-fg-strong">The story so far</h2>
          {lenses.length > 1 ? (
            <ToggleGroup
              type="single"
              appearance="separate"
              variant="outline"
              size="sm"
              aria-label="Show"
              className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
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
        </div>
      </div>
    </main>
  );
}
