import { Link } from "@tanstack/react-router";
import { CalendarRange, ChevronRight, Settings } from "lucide-react";
import { weekNotes } from "../../content";
import { noteFor } from "../../content/weeks";
import { AskNow } from "../facts/AskNow";
import { useApp } from "../household/useApp";
import { ItemList } from "../library/ItemList";
import { QuestionsWaiting } from "../questions/questions";
import { ComingUp } from "../tasks/ComingUp";
import { ToDoNow } from "../tasks/ToDoNow";
import { WeekNote } from "../weeks/WeekNote";
import { Hero, Welcome } from "./Now";

/**
 * Home, This week: what you open the app for. Where you are first, then what
 * to do now, the week's note (read as you), what Expecting needs to know,
 * what's worth knowing this week, and what's coming. On a desktop the
 * week sits on the left and the doing on the right; on a phone it's one
 * column, the doing first.
 */
export function Home() {
  const { state, questions, today, position, now, items } = useApp();
  const { dueDate } = state.household;
  const note = now === null ? null : noteFor(weekNotes, now);
  const starting = now === null ? [] : items.filter((i) => i.from === now);
  const openQuestions = questions.filter((q) => !q.askedAt).length;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <header className="flex items-start justify-between gap-3 pt-[max(1.5rem,env(safe-area-inset-top))] pb-6 lg:pt-10 lg:pb-10">
        {position && dueDate ? (
          <Hero position={position} dueDate={dueDate} today={today} size={note?.week === now ? note.size : null} />
        ) : (
          <h1 className="text-2xl font-semibold text-fg-strong lg:text-3xl">This week</h1>
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
            <div className="order-2 lg:order-none">
              <WeekNote note={note} showSize={note.week !== now} />
            </div>
          ) : null}
          {starting.length > 0 ? (
            <section aria-labelledby="worth-knowing" className="order-4 flex flex-col gap-2 lg:order-none">
              <h2 id="worth-knowing" className="text-lg font-semibold text-fg-strong">
                Worth knowing this week
              </h2>
              <ItemList items={starting} />
            </section>
          ) : null}
          <Link to="/timeline" className="order-7 flex min-h-11 w-fit items-center gap-2 rounded-md text-sm text-fg-subtle hover:text-fg-normal lg:order-none">
            <CalendarRange aria-hidden size={16} className="text-fg-brand" />
            The whole pregnancy, week by week
            <ChevronRight aria-hidden size={16} />
          </Link>
        </div>

        <div className="contents lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-8">
          <div className="order-1 lg:order-none">
            <ToDoNow />
          </div>
          <div className="order-3 empty:hidden lg:order-none">
            <AskNow />
          </div>
          <div className="order-5 empty:hidden lg:order-none">
            <ComingUp />
          </div>
          {openQuestions > 0 ? (
            <div className="order-6 lg:order-none">
              <QuestionsWaiting count={openQuestions} />
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
