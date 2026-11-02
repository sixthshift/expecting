import { Button } from "@sixthshift/design-system/button";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Printer } from "lucide-react";
import { useMemo } from "react";
import { useAppetite } from "../../../api/rpc/appetite";
import { useBingo } from "../../../api/rpc/bingo";
import { useChecklist } from "../../../api/rpc/checklist";
import { useExtras } from "../../../api/rpc/extras";
import { useFeelings } from "../../../api/rpc/feelings";
import { useFirsts } from "../../../api/rpc/firsts";
import { useItsTime } from "../../../api/rpc/itsTime";
import { useJournal } from "../../../api/rpc/journal";
import { usePapers } from "../../../api/rpc/papers";
import { usePeople } from "../../../api/rpc/people";
import { usePhotos } from "../../../api/rpc/photos";
import { useQuiet } from "../../../api/rpc/quiet";
import { useNow, useSettings } from "../../../api/rpc/settings";
import { useWeekly } from "../../../api/rpc/weekly";
import { useKeepSame } from "../../../app/hooks/useKeepSame";
import { moments } from "../../../lib/bingo";
import { CHAPTERS, type Chapter, contents } from "../../../lib/chapters";
import { formatDate, todayISO } from "../../../lib/dates";
import { extrasOn } from "../../../lib/extras";
import { hasRecap, recapParts } from "../../../lib/recap";
import { type StoryItem, storyItems } from "../../../lib/story";
import { type Week, weekLabel } from "../../../lib/timeline";
import { pairs } from "../../../lib/weekly";
import { useTasks } from "../../tasks/hooks/useTasks";
import { Contents } from "../components/Contents";
import { RecapPartView, useRecap } from "../components/Recap";
import { weekTitle } from "../model/weekTitle";

const PART_TITLE = {
  firsts: "Firsts",
  bump: "The bump",
  scans: "Scans",
  craved: "Most craved",
  voices: "In your own words",
  letters: "Letters to them",
  done: "What you got done",
} as const;

/** The weeks of a chapter so far, as Expecting has written them: each week's title. */
function WeeksWritten({ from, to }: { from: Week; to: Week }) {
  const weeks = Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
  if (weeks.length === 0) return null;
  return (
    <ol className="flex flex-col text-sm text-fg-subtle">
      {weeks.map((w) => (
        <li key={w} className="flex gap-3">
          <span className="w-16 shrink-0 tabular-nums">{weekLabel(w)}</span>
          <span>{weekTitle(w)}</span>
        </li>
      ))}
    </ol>
  );
}

/** A chapter: its weeks so far, written, then what you kept in them, each part only when it has something. */
function ChapterPage({ chapter, items, now }: { chapter: Chapter; items: readonly StoryItem[]; now: Week | null }) {
  const weeks = chapter.weeks ?? [1, 1];
  const recap = useRecap({ key: chapter.key, title: chapter.title, from: weeks[0], to: weeks[1] }, items);
  const reached = chapter.weeks !== null && now !== null && now >= weeks[0];
  return (
    <section aria-labelledby={`chapter-${chapter.key}`} className="flex break-inside-avoid-page flex-col gap-5">
      <h2 id={`chapter-${chapter.key}`} className="font-display text-2xl font-semibold text-fg-strong">
        {chapter.title}
      </h2>
      {chapter.weeks === null ? (
        <p className="text-fg-subtle">This chapter comes with the birth.</p>
      ) : !reached ? (
        <p className="text-fg-subtle">Still to come: {`weeks ${weeks[0]}–${weeks[1]}`}.</p>
      ) : (
        <>
          <WeeksWritten from={weeks[0]} to={Math.min(weeks[1], now ?? weeks[1])} />
          {recap && hasRecap(recap)
            ? recapParts(recap).map((part) => (
                <section key={part} aria-label={PART_TITLE[part]} className="flex break-inside-avoid flex-col gap-3">
                  <h3 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">{PART_TITLE[part]}</h3>
                  {/* The flipbook prints as its last frame. */}
                  <RecapPartView recap={recap} part={part} />
                </section>
              ))
            : null}
        </>
      )}
    </section>
  );
}

/**
 * The book: the pregnancy, a chapter a part of it, begun by Expecting from
 * the first visit (each week's title, as written) and filled by what you
 * keep; to print or save as a PDF from the phone's or computer's own print.
 * While something has happened, only a line: everything kept is in the
 * Journal, as it was.
 */
export function BookPage() {
  // The story, built as the Journal builds it (`JournalPageProvider`).
  const { data: journal } = useJournal();
  const { data: appetite } = useAppetite();
  const { data: photos } = usePhotos();
  const { data: papers } = usePapers();
  const { data: feelings } = useFeelings();
  const { data: firsts } = useFirsts();
  const { data: checklist } = useChecklist();
  const { data: itsTime } = useItsTime();
  const { data: weekly } = useWeekly();
  // A question a week's answers, while its extra is on: turned off, they're hidden, not deleted.
  const { data: asking } = useExtras({ select: (e) => extrasOn(e).has("question-a-week") });
  const { data: bingo } = useBingo();
  const { data: playing } = useExtras({ select: (e) => extrasOn(e).has("pregnancy-bingo") });
  const tasks = useTasks();
  const built = useMemo(
    () =>
      storyItems({
        journal,
        appetite,
        photos,
        papers,
        feelings,
        firsts,
        ticks: checklist.ticks,
        titles: new Map(tasks.map((t) => [t.id, t.title])),
        starts: itsTime.starts,
        weekly: asking ? pairs(weekly, (at) => todayISO(new Date(at))) : [],
        bingo: playing ? moments(bingo.cards) : [],
      }),
    [journal, appetite, photos, papers, feelings, firsts, checklist.ticks, tasks, itsTime.starts, weekly, asking, bingo, playing]
  );
  // Rebuilt in full on any change: the lines that didn't change are kept as they were, so their days aren't drawn again.
  const items = useKeepSame(built);
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  const { data: people } = usePeople();
  const now = useNow();
  const names = [...people.people].sort((a, b) => Number(b.role === "carrying") - Number(a.role === "carrying")).map((p) => p.name);
  const lines = contents({ items, dueDate: settings.dueDate, now });

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
      <div className="max-w-3xl">
        <Link to="/journal" className="mt-4 flex min-h-11 items-center gap-1 text-sm text-fg-subtle print:hidden">
          <ChevronLeft aria-hidden size={16} /> The Journal
        </Link>
        {quiet ? (
          <p className="py-10 text-fg-subtle">Everything you kept is in the Journal, as it was.</p>
        ) : (
          <>
            <header className="my-8 flex flex-col gap-2 rounded-xl bg-linear-to-br from-(--expecting-accent-soft-from) to-(--expecting-accent-soft-to) px-6 py-12 text-center">
              <h1 className="font-display text-4xl font-semibold text-fg-strong">Our pregnancy</h1>
              {names.length > 0 ? <p className="text-fg-normal">{names.join(" & ")}</p> : null}
              {settings.dueDate ? <p className="text-sm text-fg-subtle">Due {formatDate(settings.dueDate, { month: "long", year: "numeric" })}</p> : null}
            </header>
            <div className="mb-10 flex flex-col gap-4">
              <h2 className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">Contents</h2>
              <Contents lines={lines} />
              <Button variant="outline" size="sm" className="self-start print:hidden" onClick={() => window.print()}>
                <Printer aria-hidden size={16} /> Print or save as a PDF
              </Button>
            </div>
            {settings.dueDate ? (
              <div className="flex flex-col gap-14">
                {CHAPTERS.map((c) => (
                  <ChapterPage key={c.key} chapter={c} items={items} now={now} />
                ))}
              </div>
            ) : (
              <p className="text-fg-subtle">
                With a due date, Expecting writes the weeks in.{" "}
                <Link to="/settings" search={{ ask: "dueDate" }} className="underline print:hidden">
                  Add your due date
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
