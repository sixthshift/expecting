import { getRouteApi, Link } from "@tanstack/react-router";
import { CalendarRange, ChevronRight, Settings } from "lucide-react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useQuestions } from "../../../api/rpc/questions";
import { useNow, usePosition, useSettings } from "../../../api/rpc/settings";
import { weekNotes } from "../../../content";
import { asks } from "../../../content/schema";
import { noteFor } from "../../../content/weeks";
import { todayISO } from "../../../lib/dates";
import { askedWeeks } from "../../../lib/timelineMap";
import { ItemList } from "../../library/components/ItemList";
import { useItems } from "../../library/hooks/useItems";
import { AskedQuestion, QuestionsWaiting } from "../../questions/components/questions/questions";
import { OfferExtra } from "../../settings/components/extras/OfferExtra";
import { AskNow } from "../../settings/components/facts/AskNow";
import { ComingUp } from "../../tasks/components/comingUp/ComingUp";
import { TaskRow } from "../../tasks/components/TaskRow";
import { ToDoNow } from "../../tasks/components/toDoNow/ToDoNow";
import { useTasks } from "../../tasks/hooks/useTasks";
import { WeekNote } from "../../weeks/components/weekNote/WeekNote";
import { Hero, Welcome } from "../components/now/Now";

/**
 * Home, This week: what you open the app for. Where you are first, then what
 * to do now, the week's note (read as you), what Expecting needs to know,
 * what's worth knowing this week, and what's coming. On a desktop the
 * week sits on the left and the doing on the right; on a phone it's one
 * column, the doing first.
 *
 * A peek at another week (?at=29) shows that week instead: its note, what's
 * worth knowing, and what's best done then. What to do now stays with now.
 */
const route = getRouteApi("/app/");

export function Home() {
  const { data: settings } = useSettings();
  const { data: checklist } = useChecklist();
  const position = usePosition();
  const now = useNow();
  const items = useItems();
  const tasks = useTasks();
  const { data: questions } = useQuestions();
  const today = todayISO();
  const { at } = route.useSearch();
  const { dueDate } = settings;
  // The week shown: this one, or the one peeked at (only once there is a this week).
  const week = now === null ? null : (at ?? now);
  const peeking = week !== now;
  // Now, the note in force carries on until the next; a peek shows only that week's own.
  const inForce = week === null ? null : noteFor(weekNotes, week);
  const note = peeking && inForce?.week !== week ? null : inForce;
  // What asks something of you, from this week; the rest of what has weeks is in the Library.
  const starting = week === null ? [] : items.filter((i) => asks(i) && i.from === week);
  const thatWeek = week === null ? [] : tasks.filter((t) => t.due === week || t.deadline === week);
  const openQuestions = questions.filter((q) => !q.askedAt).length;
  const askedIn = askedWeeks(questions, dueDate);
  const asked = questions.filter((q) => week !== null && askedIn.get(q.id) === week);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <header className="flex items-start justify-between gap-3 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 lg:pt-10 lg:pb-10">
        {position && dueDate && week !== null ? (
          <Hero week={week} position={position} dueDate={dueDate} today={today} size={note?.week === week ? note.size : null} />
        ) : (
          <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">This week</h1>
        )}
        <Link to="/settings" aria-label="Settings" className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle lg:hidden">
          <Settings aria-hidden size={20} />
        </Link>
      </header>
      {!dueDate ? <Welcome /> : null}

      {/* Phone: one column in `order`. Desktop: the week left, the doing right. */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-10">
        <div className="contents lg:flex lg:flex-col lg:gap-8">
          {note ? (
            <div className="order-2 lg:order-0">
              <WeekNote key={note.week} note={note} showSize={note.week !== week} />
            </div>
          ) : null}
          {asked.length > 0 ? (
            <section aria-labelledby="asked" className="order-4 flex flex-col gap-2 lg:order-0">
              <h2 id="asked" className="text-lg font-display font-semibold text-fg-strong">
                {peeking ? "Asked that week" : "Asked this week"}
              </h2>
              {asked.map((q) => (
                <AskedQuestion key={q.id} question={q} />
              ))}
            </section>
          ) : null}
          {starting.length > 0 ? (
            <section aria-labelledby="worth-knowing" className="order-4 flex flex-col gap-2 lg:order-0">
              <h2 id="worth-knowing" className="text-lg font-display font-semibold text-fg-strong">
                {peeking ? "Worth knowing that week" : "Worth knowing this week"}
              </h2>
              <ItemList items={starting} />
            </section>
          ) : null}
          <Link
            to="/timeline"
            search={peeking && week !== null ? { at: week } : {}}
            className="order-7 flex min-h-11 w-fit items-center gap-2 rounded-md text-sm text-fg-subtle hover:text-fg-normal lg:order-0"
          >
            <CalendarRange aria-hidden size={16} className="text-fg-brand" />
            The whole pregnancy, week by week
            <ChevronRight aria-hidden size={16} />
          </Link>
        </div>

        {peeking ? (
          <div className="contents lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-8">
            <section aria-labelledby="that-week" className="order-1 flex flex-col gap-2 lg:order-0">
              <h2 id="that-week" className="text-lg font-display font-semibold text-fg-strong">
                Best done that week
              </h2>
              {thatWeek.length === 0 ? (
                <p className="text-fg-subtle">Nothing falls due that week.</p>
              ) : (
                <div className="flex flex-col">
                  {thatWeek.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      ticked={Boolean(checklist.ticks[task.id])}
                      meta={task.deadline === week ? "deadline" : undefined}
                      action={
                        task.itemId ? (
                          <Link
                            to="/library/$itemId"
                            params={{ itemId: task.itemId }}
                            aria-label={`Why: ${task.title}`}
                            className="shrink-0 px-1 text-xs text-fg-subtle underline"
                          >
                            Why
                          </Link>
                        ) : null
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="contents lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-8">
            <div className="order-1 lg:order-0">
              <ToDoNow />
            </div>
            <div className="order-3 empty:hidden lg:order-0">
              <AskNow />
            </div>
            <div className="order-5 empty:hidden lg:order-0">
              <OfferExtra />
            </div>
            <div className="order-5 empty:hidden lg:order-0">
              <ComingUp />
            </div>
            {openQuestions > 0 ? (
              <div className="order-6 lg:order-0">
                <QuestionsWaiting count={openQuestions} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
