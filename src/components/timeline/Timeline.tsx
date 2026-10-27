import { Card } from "@sixthshift/design-system/card";
import { cn } from "@sixthshift/design-system/utils";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { LocateFixed, Settings, Sprout } from "lucide-react";
import { Fragment, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { builtInItems, builtInTasks } from "../../content";
import type { Question } from "../../db/models/questions/repo";
import { buildChecklist } from "../../lib/checklist";
import { addDays, daysBetween, formatDate, type ISODate, todayISO } from "../../lib/dates";
import { gestationLabel, type Position, positionOn, type Slot, slotKey } from "../../lib/timeline";
import { buildBands, rulerMarks, VIEWS, type View } from "../../lib/timelineView";
import { saveHousehold } from "../../server/functions/household";
import { DateForm } from "../DateForm";
import { AddQuestion, OpenQuestion } from "../questions";
import type { HouseholdState } from "../state";
import { Band } from "./Band";
import { Ruler } from "./Ruler";

type Props = { state: HouseholdState; questions: Question[]; view: View; at: string | undefined };

/** Pixels from the top of the window where a week counts as in view: below the sticky bar, past a band's scroll margin (scroll-mt-32 = 128px). */
const READING_LINE = 140;

/** Where the timeline changes chapter, named once at the first week shown in it. */
function chapter(slot: Slot): string {
  if (slot.phase === "before") return "Before";
  if (slot.phase === "postpartum") return "After the birth";
  return slot.week <= 13 ? "First trimester" : slot.week <= 27 ? "Second trimester" : "Third trimester";
}

/**
 * The app: the whole pregnancy as one scroll of weeks, opened at this one.
 * The ruler (the rail on a desktop, the scrubber under a phone's thumb) moves
 * along it; the views fold it down to what you came for without losing your
 * place in time.
 */
export function Timeline({ state, questions, view, at }: Props) {
  const navigate = useNavigate();
  const today = todayISO();
  const { dueDate, birthDate } = state.household;
  const position = dueDate ? positionOn(today, dueDate, birthDate) : null;
  const now = position?.slot ?? null;
  const nowKey = now ? slotKey(now) : null;

  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set([at, nowKey].filter((k): k is string => Boolean(k))));
  const [pendingItem, setPendingItem] = useState<string | null>(null);

  const tasks = useMemo(() => buildChecklist(builtInTasks, state.ownTasks), [state.ownTasks]);
  const bands = buildBands({ items: builtInItems, tasks, ticks: state.ticks, tickedHere, questions, now, dueDate, birthDate, view });
  const marks = useMemo(() => rulerMarks(builtInItems, tasks, state.ticks, now), [tasks, state.ticks, now]);
  const indexOf = useCallback((key: string) => marks.findIndex((m) => m.key === key), [marks]);

  const elements = useRef(new Map<string, HTMLElement>());
  const register = useCallback((key: string, el: HTMLElement | null) => {
    if (el) elements.current.set(key, el);
    else elements.current.delete(key);
  }, []);

  // The week in view drives the ruler: the last week whose top has passed the
  // reading line, just under the sticky bar. A week lands a little above that
  // line when jumped to (its scroll margin), so a jump always reads as that week.
  const [active, setActive] = useState(() => Math.max(0, indexOf(at ?? nowKey ?? "before")));
  const bandKeys = bands.map((b) => b.key).join(",");
  useEffect(() => {
    const keys = bandKeys.split(",");
    let frame = 0;
    const measure = () => {
      frame = 0;
      let current = keys[0];
      for (const key of keys) {
        const el = elements.current.get(key);
        if (el && el.getBoundingClientRect().top <= READING_LINE) current = key;
        else if (el) break;
      }
      if (current) setActive(indexOf(current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [bandKeys, indexOf]);

  const scrollTo = useCallback((key: string, smooth: boolean) => {
    elements.current.get(key)?.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "auto" });
  }, []);

  // Open where asked, else at this week; with no due date, at the top.
  // On arrival, on a change of view, and when "now" first appears (the due date
  // was just entered) or moves (it was changed): go there, and open that week.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `at` is read on those occasions only, not followed
  useEffect(() => {
    const target = at ?? nowKey;
    if (!target) return;
    setExpanded((s) => (s.has(target) ? s : new Set(s).add(target)));
    setActive(Math.max(0, indexOf(target)));
    requestAnimationFrame(() => scrollTo(target, false));
  }, [view, nowKey]);

  // A jump to an item waits for its week to open, then lands on the card.
  useEffect(() => {
    if (!pendingItem) return;
    const el = document.getElementById(`item-${pendingItem}`);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
      setPendingItem(null);
    }
  });

  /** From the ruler: go to that week, or the nearest one this view shows. */
  function seek(index: number, settle: boolean) {
    setActive(index);
    const shown = bands.map((b) => indexOf(b.key));
    const nearest = shown.reduce((best, i) => (Math.abs(i - index) < Math.abs(best - index) ? i : best), shown[0] ?? 0);
    const key = marks[nearest]!.key;
    if (settle && view === "all") setExpanded((s) => new Set(s).add(key));
    scrollTo(key, settle);
  }

  function toggle(key: string) {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function onTick(taskId: string, ticked: boolean) {
    if (ticked) setTickedHere((ids) => new Set(ids).add(taskId));
  }

  function openItem(itemId: string) {
    const item = builtInItems.find((i) => i.id === itemId);
    if (!item) return;
    const key = slotKey(item.from);
    setExpanded((s) => new Set(s).add(key));
    setPendingItem(itemId);
    if (view !== "all") navigate({ to: "/", search: { at: key } });
  }

  const openQuestions = questions.filter((q) => !q.askedAt);
  const nowContent = (
    <>
      {position ? <NowLine position={position} dueDate={dueDate!} today={today} /> : null}
      {view === "questions" ? <NextAppointment open={openQuestions} /> : null}
    </>
  );

  return (
    <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
      {/* Desktop: the rail is the timeline at a glance. */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border-subtle bg-bg-normal px-4 pt-6 pb-4 lg:flex">
        <p className="mb-4 flex items-center gap-2 text-lg font-semibold text-fg-strong">
          <Sprout aria-hidden size={22} className="text-fg-brand" />
          Expecting
        </p>
        <Ruler marks={marks} active={active} onSeek={seek} orientation="vertical" className="min-h-0 flex-1" />
        <Link to="/settings" className="mt-4 flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-fg-subtle hover:bg-bg-subtle-hovered">
          <Settings aria-hidden size={18} />
          Settings
        </Link>
      </aside>

      <div className="min-w-0">
        <TopBar view={view} position={position} onToday={() => nowKey && seek(indexOf(nowKey), true)} />

        <main className="mx-auto max-w-5xl px-4 pt-2 pb-32 md:px-8 lg:pb-24">
          <h1 className="sr-only">Expecting: {VIEWS[view].toLowerCase()}, week by week</h1>
          {!dueDate ? <Welcome /> : null}
          {view === "questions" && !now ? <NextAppointment open={openQuestions} /> : null}
          {bands.length === 0 ? <p className="py-8 text-fg-subtle">Nothing here.</p> : null}
          {bands.map((band, i) => {
            const label = chapter(band.slot);
            const prev = bands[i - 1];
            return (
              <Fragment key={band.key}>
                {!prev || chapter(prev.slot) !== label ? (
                  <p className="mt-8 mb-2 text-xs font-semibold tracking-widest text-fg-subtle uppercase first:mt-4">{label}</p>
                ) : null}
                <Band
                  band={band}
                  view={view}
                  expanded={expanded.has(band.key)}
                  onToggle={() => toggle(band.key)}
                  ticks={state.ticks}
                  onTick={onTick}
                  onOpenItem={openItem}
                  dueDate={dueDate}
                  birthDate={birthDate}
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

      {/* Phone: the scrubber, under the thumb. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border-subtle bg-bg-normal/95 px-5 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <Ruler marks={marks} active={active} onSeek={seek} orientation="horizontal" className="h-11" />
      </div>
    </div>
  );
}

function TopBar({ view, position, onToday }: { view: View; position: Position | null; onToday: () => void }) {
  return (
    <div className="sticky top-0 z-10 border-b border-border-subtle bg-bg-subtle/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-2">
          {position ? (
            <button type="button" onClick={onToday} className="flex min-h-11 items-center gap-2 text-left font-semibold text-fg-strong">
              <LocateFixed aria-hidden size={18} className="text-fg-brand" />
              Today
            </button>
          ) : (
            <span className="font-semibold text-fg-strong">Expecting</span>
          )}
          <Link to="/settings" aria-label="Settings" className="flex size-11 items-center justify-center rounded-md text-fg-subtle lg:hidden">
            <Settings aria-hidden size={20} />
          </Link>
        </div>
        <nav aria-label="Views" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <ul className="flex gap-2">
            {(Object.keys(VIEWS) as View[]).map((v) => (
              <li key={v}>
                <Link
                  to="/"
                  search={v === "all" ? {} : { view: v }}
                  aria-current={v === view ? "page" : undefined}
                  className={cn(
                    "flex min-h-9 items-center rounded-full border px-3 text-sm whitespace-nowrap",
                    v === view ? "border-border-brand-strong bg-bg-brand-strong text-fg-on-brand-strong" : "border-border-normal bg-bg-normal text-fg-normal"
                  )}
                >
                  {VIEWS[v]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function NowLine({ position, dueDate, today }: { position: Position; dueDate: ISODate; today: ISODate }): ReactNode {
  if (position.gestationDays !== undefined) {
    const toGo = daysBetween(today, dueDate);
    return (
      <p className="text-lg text-fg-strong">
        <span className="font-semibold">{gestationLabel(position.gestationDays)}</span>
        {" · "}
        {toGo > 0 ? `${toGo} days to go` : toGo === 0 ? "due today" : `${-toGo} days past the due date`}
        <span className="text-fg-subtle"> · due {formatDate(dueDate)}</span>
      </p>
    );
  }
  const d = position.daysSinceBirth ?? 0;
  return <p className="text-lg text-fg-strong">{d === 0 ? "Born today" : `${d} ${d === 1 ? "day" : "days"} old`}</p>;
}

function NextAppointment({ open }: { open: Question[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-fg-subtle">For the next appointment{open.length > 0 ? ` · ${open.length}` : ""}</p>
      <AddQuestion />
      {open.map((q) => (
        <OpenQuestion key={q.id} question={q} />
      ))}
    </div>
  );
}

function Welcome() {
  const router = useRouter();
  const today = todayISO();
  return (
    <Card size="lg" className="my-6 max-w-lg">
      <DateForm
        label="When's the baby due?"
        description="Your best estimate is fine; change it after the dating scan. The timeline below is all readable either way."
        value={null}
        submitLabel="Start"
        minDate={addDays(today, -7 * 3)}
        maxDate={addDays(today, 7 * 44)}
        onSave={async (date) => {
          await saveHousehold({ data: { dueDate: date } });
          await router.invalidate();
        }}
      />
    </Card>
  );
}
