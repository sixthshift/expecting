import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import { useChecklistQuery } from "../../../api/rpc/checklist";
import { useJournalQuery } from "../../../api/rpc/journal";
import { useQuestionsQuery } from "../../../api/rpc/questions";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { useNow, usePosition, useSettingsQuery } from "../../../api/rpc/settings";
import { PhoneCorner } from "../../../app/components/layout/PillarLayout";
import { dayReads, weekNotes } from "../../../content";
import { readsOut } from "../../../content/days";
import { noteFor } from "../../../content/weeks";
import { todayISO } from "../../../lib/dates";
import { entriesIn } from "../../../lib/journal";
import { headsUps, worthKnowing } from "../../../lib/library";
import { askedWeeks } from "../../../lib/timelineMap";
import { CheckIn } from "../../feelings/components/checkIn/CheckIn";
import { HardFortnight } from "../../feelings/components/fortnight/HardFortnight";
import { LookThrough } from "../../itsTime/components/wayIn/LookThrough";
import { Movement } from "../../journal/components/entries/movements/Movement";
import { Note } from "../../journal/components/entries/notes/Note";
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
import { WeeklyCard } from "../../weekly/components/WeeklyCard";
import { DayByDay } from "../components/dayByDay/DayByDay";
import { HeadsUp } from "../components/headsUp/HeadsUp";
import { Hero, Welcome } from "../components/now/Now";
import { WorthKnowing } from "../components/worthKnowing/WorthKnowing";

/**
 * This week, home: what you open the app for. Where you are first, then what
 * to do now, how you are today, the week day by day (its note, read as you, then a read a day), the week's heads-up, what
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
  const { data: quiet } = useQuietQuery();
  return quiet ? <QuietWeek quiet={quiet} /> : <Week />;
}

function Week() {
  const { data: settings } = useSettingsQuery();
  const { data: checklist } = useChecklistQuery();
  const position = usePosition();
  const now = useNow();
  const items = useItems();
  const tasks = useTasks();
  const { data: questions } = useQuestionsQuery();
  const { data: journal } = useJournalQuery();
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
  // The week's reads out so far: up to today in this one, all of a week gone, none of one to come.
  const reads = week === null || !position ? [] : readsOut(dayReads, week, position.gestationDays);
  const thatWeek = week === null ? [] : tasks.filter((t) => t.due === week || t.deadline === week);
  const openQuestions = questions.filter((q) => !q.askedAt).length;
  const askedIn = askedWeeks(questions, dueDate);
  const asked = questions.filter((q) => week !== null && askedIn.get(q.id) === week);
  const kept = peeking && week !== null ? entriesIn(journal, week, dueDate) : [];
  // The weeks with something still to do best done by then, for the strip.
  const dueWeeks = new Set(tasks.filter((t) => !checklist.ticks[t.id]).map((t) => t.due));

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      {/* Phone: one column in `order`, the week's header first. Desktop: the header and the week on the left,
          the doing on the right from the top, beside the header rather than under it. */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10 lg:gap-y-10">
        <div className="flex flex-col gap-6 max-lg:-mb-2 lg:col-start-1 lg:row-start-1">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 pt-[max(1.5rem,env(safe-area-inset-top))] lg:pt-10">
            {position && dueDate && week !== null ? (
              <Hero week={week} position={position} dueDate={dueDate} today={today} size={note?.week === week ? note.size : null} due={dueWeeks} />
            ) : (
              <h1 className="col-start-1 row-start-1 text-2xl font-display font-semibold text-fg-strong lg:text-3xl">This week</h1>
            )}
            <div className="col-start-2 row-start-1">
              <PhoneCorner />
            </div>
          </header>
          {!dueDate ? <Welcome /> : null}
        </div>
        <div className="contents lg:col-start-1 lg:row-start-2 lg:flex lg:flex-col lg:gap-8">
          {week !== null && (note || reads.length > 0) ? (
            <div className="order-2 lg:order-0">
              <DayByDay
                key={week}
                week={week}
                note={note}
                reads={reads}
                items={items}
                today={peeking || !position ? null : position.gestationDays - position.week * 7}
                showSize={note?.week !== week}
              />
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
              {kept.map((entry) => (entry.kind === "movement" ? <Movement key={entry.id} entry={entry} /> : <Note key={entry.id} entry={entry} />))}
            </section>
          ) : null}
          {starting.length > 0 ? (
            <div className="order-4 lg:order-0">
              <WorthKnowing key={week} items={starting} peeking={peeking} />
            </div>
          ) : null}
        </div>

        {peeking ? (
          <div className="contents lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-10 lg:flex lg:flex-col lg:gap-8">
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
          <div className="contents lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-10 lg:flex lg:flex-col lg:gap-8">
            <div className="order-1 empty:hidden lg:order-0">
              <LookThrough />
            </div>
            <div className="order-1 lg:order-0">
              <ToDoNow />
            </div>
            <div className="order-1 empty:hidden lg:order-0">
              <HardFortnight />
            </div>
            <div className="order-1 empty:hidden lg:order-0">
              <CheckIn />
            </div>
            <div className="order-3 empty:hidden lg:order-0">
              <WeeklyCard />
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
