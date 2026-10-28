import { Link } from "@tanstack/react-router";
import { LocateFixed, Settings } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { weekNotes } from "../../content";
import { type Position, WEEKS, type Week as WeekNumber } from "../../lib/timeline";
import { buildBands, rulerMarks } from "../../lib/timelineView";
import { NowLine, Welcome } from "../home/Now";
import { useApp } from "../household/useApp";
import { QuestionsWaiting } from "../questions/questions";
import { Week } from "../weeks/Week";
import { Ruler } from "./Ruler";

/** Pixels from the top of the window where a week counts as in view: below the sticky bar, past a band's scroll margin (scroll-mt-32 = 128px). */
const READING_LINE = 140;

/** A week's place on the ruler. */
const indexOf = (week: WeekNumber) => week - WEEKS.first;

/** Where the timeline changes chapter, named once at the first week shown in it. */
function chapter(week: WeekNumber): string {
  return week <= 13 ? "First trimester" : week <= 27 ? "Second trimester" : "Third trimester";
}

/**
 * The thread through the pillars: the whole pregnancy as one scroll of weeks,
 * opened at this one. What the Library explains, the Planner asks and the
 * Journal keeps meet here on their week. The ruler (a rail on a desktop, a
 * scrubber above a phone's tab bar) moves along it.
 */
export function Timeline({ at }: { at: WeekNumber | undefined }) {
  const { state, questions, today, position, now, items, tasks } = useApp();
  const { dueDate } = state.household;

  const [expanded, setExpanded] = useState<ReadonlySet<WeekNumber>>(() => new Set([at, now].filter((w): w is WeekNumber => w != null)));
  const [pendingItem, setPendingItem] = useState<string | null>(null);

  const bands = buildBands({ notes: weekNotes, items, tasks, ticks: state.ticks, questions, now, dueDate });
  const marks = useMemo(() => rulerMarks(items, tasks, state.ticks, now), [items, tasks, state.ticks, now]);

  const elements = useRef(new Map<WeekNumber, HTMLElement>());
  const register = useCallback((week: WeekNumber, el: HTMLElement | null) => {
    if (el) elements.current.set(week, el);
    else elements.current.delete(week);
  }, []);

  // The week in view drives the ruler: the last week whose top has passed the
  // reading line, just under the sticky bar. A week lands a little above that
  // line when jumped to (its scroll margin), so a jump always reads as that week.
  const [active, setActive] = useState(() => indexOf(at ?? now ?? WEEKS.first));
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      let current: WeekNumber = WEEKS.first;
      for (const [week, el] of [...elements.current].sort(([a], [b]) => a - b)) {
        if (el.getBoundingClientRect().top <= READING_LINE) current = week;
        else break;
      }
      setActive(indexOf(current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const scrollTo = useCallback((week: WeekNumber, smooth: boolean) => {
    elements.current.get(week)?.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Open where asked, else at this week; with no due date, at the top.
  // On arrival, and when "now" first appears (the due date was just entered) or
  // moves (it was changed): go there, and open that week.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `at` is read on those occasions only, not followed
  useEffect(() => {
    const target = at ?? now;
    if (target === null) return;
    setExpanded((s) => (s.has(target) ? s : new Set(s).add(target)));
    setActive(indexOf(target));
    requestAnimationFrame(() => scrollTo(target, false));
  }, [now]);

  // A jump to an item waits for its week to open, then lands on the card.
  useEffect(() => {
    if (!pendingItem) return;
    const el = document.getElementById(`item-${pendingItem}`);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
      setPendingItem(null);
    }
  });

  /** From the ruler: go to that week, and open it once the ruler settles. */
  function seek(index: number, settle: boolean) {
    setActive(index);
    const week = marks[index]!.week;
    if (settle) setExpanded((s) => new Set(s).add(week));
    scrollTo(week, settle);
  }

  function toggle(week: WeekNumber) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  }

  function openItem(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    setExpanded((s) => new Set(s).add(item.from));
    setPendingItem(itemId);
  }

  const openQuestions = questions.filter((q) => !q.askedAt).length;
  const nowContent = (
    <>
      {position ? <NowLine position={position} dueDate={dueDate!} today={today} /> : null}
      {openQuestions > 0 ? <QuestionsWaiting count={openQuestions} /> : null}
    </>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_10rem]">
      {/* Desktop: the ruler down the right edge is the timeline at a glance. */}
      <aside aria-label="Timeline ruler" className="sticky top-0 hidden h-dvh border-l border-border-subtle bg-bg-normal px-3 pt-6 pb-4 lg:order-last lg:flex">
        <Ruler marks={marks} active={active} onSeek={seek} orientation="vertical" className="min-h-0 flex-1" />
      </aside>

      <div className="min-w-0">
        <TopBar position={position} onToday={() => now !== null && seek(indexOf(now), true)} />
        <main className="mx-auto max-w-5xl px-4 pt-2 pb-32 md:px-8 lg:pb-24">
          <h1 className="sr-only">Timeline</h1>
          {!dueDate ? <Welcome /> : null}
          {bands.map((band, i) => {
            const label = chapter(band.week);
            const prev = bands[i - 1];
            return (
              <Fragment key={band.week}>
                {!prev || chapter(prev.week) !== label ? (
                  <p className="mt-8 mb-2 text-xs font-semibold tracking-widest text-fg-subtle uppercase first:mt-4">{label}</p>
                ) : null}
                <Week
                  band={band}
                  expanded={expanded.has(band.week)}
                  onToggle={() => toggle(band.week)}
                  ticks={state.ticks}
                  onOpenItem={openItem}
                  dueDate={dueDate}
                  nowContent={nowContent}
                  register={register}
                />
              </Fragment>
            );
          })}
          {/* Room after the last week, so any week can be brought up to the reading line. */}
          <div aria-hidden className="h-[70dvh]" />
        </main>
      </div>

      {/* Phone: the scrubber, under the thumb, just above the tab bar. */}
      <div className="fixed inset-x-0 bottom-(--tab-bar) z-20 border-t border-border-subtle bg-bg-normal/95 px-5 pt-1 pb-1 backdrop-blur lg:hidden">
        <Ruler marks={marks} active={active} onSeek={seek} orientation="horizontal" className="h-11" />
      </div>
    </div>
  );
}

function TopBar({ position, onToday }: { position: Position | null; onToday: () => void }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border-subtle bg-(--expecting-page)/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2 md:px-8">
        {position ? (
          <button type="button" onClick={onToday} className="flex min-h-11 items-center gap-2 text-left font-semibold text-fg-strong">
            <LocateFixed aria-hidden size={18} className="text-fg-brand" />
            Today
          </button>
        ) : (
          <span className="font-semibold text-fg-strong">Timeline</span>
        )}
        <Link to="/settings" aria-label="Settings" className="-mr-2 flex size-11 items-center justify-center rounded-md text-fg-subtle lg:hidden">
          <Settings aria-hidden size={20} />
        </Link>
      </div>
    </div>
  );
}
