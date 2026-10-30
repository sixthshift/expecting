import { getRouteApi, Link } from "@tanstack/react-router";
import { CalendarRange, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useJournal } from "../../../api/rpc/journal";
import { useQuestions } from "../../../api/rpc/questions";
import { useQuiet } from "../../../api/rpc/quiet";
import { useNow, usePosition, useSettings } from "../../../api/rpc/settings";
import { PhoneCorner } from "../../../app/components/layout/PillarLayout";
import { weekNotes } from "../../../content";
import { noteFor } from "../../../content/weeks";
import { todayISO } from "../../../lib/dates";
import { entriesIn } from "../../../lib/journal";
import { headsUps, worthKnowing } from "../../../lib/library";
import { askedWeeks } from "../../../lib/timelineMap";
import { Note } from "../../journal/components/notes/notes";
import { ItemLink } from "../../library/components/ItemLink";
import { useItems } from "../../library/hooks/useItems";
import { AskedQuestion, QuestionsWaiting } from "../../questions/components/questions/questions";
import { QuietWeek } from "../../quiet/components/quietWeek/QuietWeek";
import { OfferExtra } from "../../settings/components/extras/OfferExtra";
import { AskNow } from "../../settings/components/facts/AskNow";
import { ComingUp } from "../../tasks/components/comingUp/ComingUp";
import { TaskRow } from "../../tasks/components/TaskRow";
import { ToDoNow } from "../../tasks/components/toDoNow/ToDoNow";
import { useTasks } from "../../tasks/hooks/useTasks";
import { WeekNote } from "../../weeks/components/weekNote/WeekNote";
import { HeadsUp } from "../components/headsUp/HeadsUp";
import { Hero, Welcome } from "../components/now/Now";
import { WorthKnowing } from "../components/worthKnowing/WorthKnowing";

/**
 * This week, home: what you open the app for. Where you are first, then what
 * to do now, the week's note (read as you), the week's heads-up, what
 * Expecting needs to know, what's worth knowing this week, and what's coming. On a desktop the
 * week sits on the left and the doing on the right; on a phone it's one
 * column, the doing first.
 *
 * A peek at another week (?at=29) shows that week instead: its note, its
 * heads-up, what's worth knowing, what's best done then, and the notes kept
 * then. What to do now stays with now; this week's notes stay in the Journal.
 *
 * While something has happened, none of it: support and the next steps instead.
 */
const route = getRouteApi("/app/");

export function ThisWeek() {
  const { data: quiet } = useQuiet();
  return quiet ? <QuietWeek quiet={quiet} /> : <Week />;
}

function Week() {
  const { data: settings } = useSettings();
  const { data: checklist } = useChecklist();
  const position = usePosition();
  const now = useNow();
  const items = useItems();
  const tasks = useTasks();
  const { data: questions } = useQuestions();
  const { data: journal } = useJournal();
  const today = todayISO();
  const { at } = route.useSearch();
  const { dueDate } = settings;
  // The week shown: this one, or the one peeked at (only once there is a this week).
  const week = now === null ? null : (at ?? now);
  const peeking = week !== now;
  // Now, the note in force carries on until the next; a peek shows only that week's own.
  const inForce = week === null ? null : noteFor(weekNotes, week);
  const note = peeking && inForce?.week !== week ? null : inForce;
  // What starts this week and belongs to it; what's any time is in the Library.
  const starting = week === null ? [] : worthKnowing(items, week);
  const cards = useMemo(() => headsUps(items), [items]);
  const headsUp = week === null ? undefined : cards.get(week);
  const thatWeek = week === null ? [] : tasks.filter((t) => t.due === week || t.deadline === week);
  const openQuestions = questions.filter((q) => !q.askedAt).length;
  const askedIn = askedWeeks(questions, dueDate);
  const asked = questions.filter((q) => week !== null && askedIn.get(q.id) === week);
  const kept = peeking && week !== null ? entriesIn(journal, week, dueDate) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <header className="flex items-start justify-between gap-3 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 lg:pt-10 lg:pb-10">
        {position && dueDate && week !== null ? (
          <Hero week={week} position={position} dueDate={dueDate} today={today} size={note?.week === week ? note.size : null} />
        ) : (
          <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">This week</h1>
        )}
        <PhoneCorner />
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
          {headsUp ? (
            <div className="order-2 lg:order-0">
              <HeadsUp card={headsUp} />
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
          {kept.length > 0 ? (
            <section aria-labelledby="kept" className="order-4 flex flex-col gap-2 lg:order-0">
              <h2 id="kept" className="text-lg font-display font-semibold text-fg-strong">
                Kept that week
              </h2>
              {kept.map((entry) => (
                <Note key={entry.id} entry={entry} />
              ))}
            </section>
          ) : null}
          {starting.length > 0 ? (
            <div className="order-4 lg:order-0">
              <WorthKnowing key={week} items={starting} peeking={peeking} />
            </div>
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
                          <ItemLink itemId={task.itemId} aria-label={`Why: ${task.title}`} className="shrink-0 px-1 text-xs text-fg-subtle underline">
                            Why
                          </ItemLink>
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
