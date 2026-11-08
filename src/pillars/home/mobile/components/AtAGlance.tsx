import { cn } from "@sixthshift/design-system/utils";
import { useRef, useState } from "react";
import { useAppointmentsQuery } from "../../../../api/rpc/appointments";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { useFeelingsQuery } from "../../../../api/rpc/feelings";
import { useFirstsQuery } from "../../../../api/rpc/firsts";
import { usePapersQuery } from "../../../../api/rpc/papers";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { usePhotosQuery } from "../../../../api/rpc/photos";
import { useQuestionsQuery } from "../../../../api/rpc/questions";
import { useSettingsQuery } from "../../../../api/rpc/settings";
import { CollapsibleCard } from "../../../../components/CollapsibleCard";
import type { OneThing } from "../../../../lib/home/oneThing";
import { askedWeeks } from "../../../../lib/home/timelineWeeks";
import { isOwn, latestOn } from "../../../../lib/journal/feelings";
import { aroundNow } from "../../../../lib/journal/firsts";
import { placesReady } from "../../../../lib/journal/places";
import { worthKnowing } from "../../../../lib/library/home";
import { appointmentSoon, nextAppointment } from "../../../../lib/planner/appointments";
import { comingUp, toDoNow } from "../../../../lib/planner/todo";
import { KeepNow } from "../../../journal/components/thisWeek/KeepNow";
import { CheckIn } from "../../../journal/features/feelings/components/checkIn/CheckIn";
import { useItems } from "../../../library/hooks/useItems";
import { NextAppointment } from "../../../planner/features/appointments/components/NextAppointment";
import { ComingUp } from "../../../planner/features/tasks/components/comingUp/ComingUp";
import { ToDoNow } from "../../../planner/features/tasks/components/toDoNow/ToDoNow";
import { useTasks } from "../../../planner/features/tasks/hooks/useTasks";
import { DayByDay } from "../../components/dayByDay/DayByDay";
import { QuestionsWaitingNow } from "../../components/doing/QuestionsWaitingNow";
import { HeadsUp } from "../../components/headsUp/HeadsUp";
import { AskedThatWeek } from "../../components/week/AskedThatWeek";
import { WorthKnowing } from "../../components/worthKnowing/WorthKnowing";
import { useHomePage } from "../../contexts/HomePageContext";
import { WeeklyCard } from "../../features/weekly/components/WeeklyCard";
import { useWeekDays } from "../../hooks/useWeekDays";

type FoldId = "do" | "keep" | "read" | "today" | "coming" | "asked";

/** Where this phone keeps which folds are open, so Home opens as you left it. */
const KEY = "expecting:home-folds";

/**
 * Home on a phone, past the one thing: the three kinds of what's now as
 * numbers (To do, To keep, To read), each opening its fold below; then the
 * folds, a line each saying what's in it, opening in place. Which are open
 * is this phone's, kept for next time. What the one thing above shows
 * (`shown`) isn't drawn again here.
 */
export function AtAGlance({ shown }: { shown: OneThing["kind"] }) {
  const { now, today, dueDate } = useHomePage();
  const { data: checklist } = useChecklistQuery();
  const { data: appointments } = useAppointmentsQuery();
  const { data: questions } = useQuestionsQuery();
  const { data: settings } = useSettingsQuery();
  const { data: firsts } = useFirstsQuery();
  const { data: photos } = usePhotosQuery();
  const { data: papers } = usePapersQuery();
  const { data: people } = usePeopleQuery();
  const { data: feelings } = useFeelingsQuery();
  const tasks = useTasks();
  const items = useItems();
  const { days, opening } = useWeekDays();
  const [open, setOpen] = useOpenFolds();
  const folds = useRef<Partial<Record<FoldId, HTMLElement | null>>>({});
  if (now === null) return null;

  const toDo = toDoNow(tasks, checklist.ticks, now);
  const late = toDo.filter((t) => t.why !== "soon").length;
  const firstsNow = aroundNow({ now, marks: firsts, knowing: settings.baby !== "unknown" });
  const places = placesReady({ now, photos, papers, dueDate });
  const me = people.me;
  const checkIn = shown !== "checkIn" && me && latestOn(feelings.filter(isOwn), me.id, today) === undefined ? 1 : 0;
  const toKeep = firstsNow.length + places.length + checkIn;
  const toRead = worthKnowing(items, now);
  const coming = comingUp(tasks, checklist.ticks, now);
  // The next appointment once it's close, unless it's today's, which is the one thing above.
  const next = nextAppointment(appointments, today);
  const askedIn = askedWeeks(questions, dueDate);
  const asked = questions.filter((q) => askedIn.get(q.id) === now);
  const appointment = next && shown !== "appointment" && appointmentSoon(next, today) !== null ? next : null;

  // A fold: where it is, to go to, and open or not, kept.
  const fold = (id: FoldId) => ({
    ref: (el: HTMLElement | null) => {
      folds.current[id] = el;
    },
    open: !!open[id],
    onToggle: () => setOpen((o) => ({ ...o, [id]: !o[id] })),
  });
  // A number opens its fold and goes to it.
  const go = (id: FoldId) => {
    setOpen((o) => ({ ...o, [id]: true }));
    requestAnimationFrame(() => folds.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <Hub label="To do" count={toDo.length} sub={late > 0 ? `${late} late` : "now"} tone="brand" onClick={() => go("do")} />
        <Hub label="To keep" count={toKeep} sub="for the Journal" tone="warm" onClick={() => go("keep")} />
        <Hub label="To read" count={toRead.length} sub="this week" onClick={() => go("read")} />
      </div>

      <div className="flex flex-col gap-2">
        <CollapsibleCard {...fold("do")} title="To do" summary={andMore(toDo.map((t) => t.task.title)) || "Nothing right now"} quietHeading>
          <ToDoNow />
        </CollapsibleCard>
        <CollapsibleCard
          {...fold("keep")}
          title="To keep"
          summary={
            [checkIn ? "How are you today?" : null, ...firstsNow.map((f) => f.title), ...places.map(() => "a place ready")]
              .filter(Boolean)
              .slice(0, 2)
              .join(" · ") || "The week's question, and anything around now"
          }
        >
          {shown === "checkIn" ? null : <CheckIn />}
          <KeepNow />
          <WeeklyCard />
        </CollapsibleCard>
        <CollapsibleCard {...fold("read")} title="To read" summary={andMore(toRead.map((i) => i.title)) || "The week's heads-up"} quietHeading>
          <WorthKnowing brief />
          <HeadsUp />
        </CollapsibleCard>
        {shown === "read" || days.length === 0 ? null : (
          <CollapsibleCard {...fold("today")} title="Today's read" summary={days[opening]?.read?.title ?? days[opening]?.note?.title ?? ""}>
            <DayByDay />
          </CollapsibleCard>
        )}
        {coming.length > 0 || appointment ? (
          <CollapsibleCard
            {...fold("coming")}
            title="Coming up"
            summary={[
              appointment ? `${appointment.title}, ${appointmentSoon(appointment, today)?.toLowerCase()}` : null,
              coming[0]?.task.title,
              coming.length > 1 ? `${coming.length - 1} more` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            quietHeading
          >
            {appointment ? <NextAppointment /> : null}
            <ComingUp />
            <QuestionsWaitingNow />
          </CollapsibleCard>
        ) : null}
        {asked.length > 0 ? (
          <CollapsibleCard {...fold("asked")} title="Asked this week" summary={andMore(asked.map((q) => q.text))} quietHeading>
            <AskedThatWeek />
          </CollapsibleCard>
        ) : null}
      </div>
    </div>
  );
}

/** The first of a fold's things, and how many more: "Book the scan, and 2 more"; "" for none. */
function andMore(titles: readonly string[]): string {
  return titles.length > 1 ? `${titles[0]}, and ${titles.length - 1} more` : (titles[0] ?? "");
}

/** One kind of what's now as a number, opening its fold. */
function Hub({ label, count, sub, tone, onClick }: { label: string; count: number; sub: string; tone?: "brand" | "warm"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-11 flex-col items-start rounded-xl border px-3 py-2.5 text-left",
        tone === "brand"
          ? "border-border-brand bg-bg-brand-subtle"
          : tone === "warm"
            ? "border-border-warning bg-bg-warning-subtle"
            : "border-border-subtle bg-bg-normal"
      )}
    >
      <span className="text-[0.625rem] font-semibold tracking-widest text-fg-subtle uppercase">{label}</span>
      <span className="font-display text-2xl leading-tight font-semibold text-fg-strong">{count}</span>
      <span className="text-xs text-fg-subtle">{sub}</span>
    </button>
  );
}

/** Which folds are open, kept on this phone; all folded on one that's never said. */
function useOpenFolds() {
  const [open, setOpenState] = useState<Partial<Record<FoldId, boolean>>>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "{}");
    } catch {
      return {};
    }
  });
  const setOpen = (next: (o: Partial<Record<FoldId, boolean>>) => Partial<Record<FoldId, boolean>>) =>
    setOpenState((o) => {
      const value = next(o);
      try {
        localStorage.setItem(KEY, JSON.stringify(value));
      } catch {}
      return value;
    });
  return [open, setOpen] as const;
}
