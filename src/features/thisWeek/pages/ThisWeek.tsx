import { useAppointmentsQuery } from "../../../api/rpc/appointments";
import { useJournalQuery } from "../../../api/rpc/journal";
import { useQuestionsQuery } from "../../../api/rpc/questions";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { PhoneCorner } from "../../../app/components/layout/PillarLayout";
import { appointmentsIn } from "../../../lib/appointments";
import { entriesIn } from "../../../lib/journal";
import { askedWeeks } from "../../../lib/timelineMap";
import { AppointmentCard } from "../../appointments/components/AppointmentCard";
import { Movement } from "../../journal/components/entries/movements/Movement";
import { Note } from "../../journal/components/entries/notes/Note";
import { AskedQuestion } from "../../questions/components/AskedQuestion";
import { DayByDay } from "../components/dayByDay/DayByDay";
import { BestDoneThatWeek } from "../components/doing/BestDoneThatWeek";
import { DoingNow } from "../components/doing/DoingNow";
import { HeadsUp } from "../components/headsUp/HeadsUp";
import { Hero } from "../components/now/Now";
import { QuietWeek } from "../components/quiet/QuietWeek";
import { Welcome } from "../components/welcome/Welcome";
import { WorthKnowing } from "../components/worthKnowing/WorthKnowing";
import { ThisWeekPageProvider, useThisWeekPage } from "../contexts/ThisWeekPageContext";

/**
 * This week, home: what you open the app for. Where you are first, then what
 * to do now (after the next appointment, once it's within a fortnight), how you are today, the week day by day (its note, read as you, then a read a day), the week's heads-up, what
 * Expecting needs to know, what's worth knowing this week, and what's coming. On a desktop the
 * week sits on the left and the doing on the right; on a phone it's one
 * column, the doing first.
 *
 * A peek at another week (?at=29) shows that week instead: its note, its
 * heads-up, what's worth knowing, what's best done then, its appointments,
 * and the notes kept then. What to do now stays with now; this week's notes stay in the Journal.
 *
 * While something has happened, none of it: support and the next steps instead.
 */
export function ThisWeek() {
  const { data: quiet } = useQuietQuery();
  return <ThisWeekPageProvider>{quiet ? <QuietWeek quiet={quiet} /> : <Week />}</ThisWeekPageProvider>;
}

function Week() {
  const { week, peeking, dueDate } = useThisWeekPage();
  const { data: questions } = useQuestionsQuery();
  const { data: journal } = useJournalQuery();
  const { data: appointments } = useAppointmentsQuery();
  const askedIn = askedWeeks(questions, dueDate);
  const asked = questions.filter((q) => week !== null && askedIn.get(q.id) === week);
  // A peek shows that week's appointments; now, the next one is with the doing.
  const thatWeeksAppointments = peeking && week !== null ? appointmentsIn(appointments, week, dueDate) : [];
  const kept = peeking && week !== null ? entriesIn(journal, week, dueDate) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      {/* Phone: one column in `order`, the week's header first. Desktop: the header and the week on the left,
          the doing on the right from the top, beside the header rather than under it. */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10 lg:gap-y-10">
        <div className="flex flex-col gap-6 max-lg:-mb-2 lg:col-start-1 lg:row-start-1">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 pt-[max(1.5rem,env(safe-area-inset-top))] lg:pt-10">
            {week !== null ? <Hero /> : <h1 className="col-start-1 row-start-1 text-2xl font-display font-semibold text-fg-strong lg:text-3xl">This week</h1>}
            <div className="col-start-2 row-start-1">
              <PhoneCorner />
            </div>
          </header>
          {!dueDate ? <Welcome /> : null}
        </div>
        <div className="contents lg:col-start-1 lg:row-start-2 lg:flex lg:flex-col lg:gap-8">
          <div className="order-2 empty:hidden lg:order-0">
            <DayByDay key={week} />
          </div>
          <div className="order-2 empty:hidden lg:order-0">
            <HeadsUp />
          </div>
          {thatWeeksAppointments.length > 0 ? (
            <section aria-labelledby="appointments-that-week" className="order-4 flex flex-col gap-2 lg:order-0">
              <h2 id="appointments-that-week" className="text-lg font-display font-semibold text-fg-strong">
                Appointments that week
              </h2>
              {thatWeeksAppointments.map((a) => (
                <AppointmentCard key={a.id} appointment={a} />
              ))}
            </section>
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
          <div className="order-4 empty:hidden lg:order-0">
            <WorthKnowing key={week} />
          </div>
        </div>

        <div className="contents lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-10 lg:flex lg:flex-col lg:gap-8">
          {peeking ? <BestDoneThatWeek /> : <DoingNow />}
        </div>
      </div>
    </main>
  );
}
