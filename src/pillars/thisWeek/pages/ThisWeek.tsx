import { useQuietQuery } from "../../../api/rpc/quiet";
import { PhoneCorner } from "../../../app/components/layout/AppLayout";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { DayByDay } from "../components/dayByDay/DayByDay";
import { BestDoneThatWeek } from "../components/doing/BestDoneThatWeek";
import { DoingNow } from "../components/doing/DoingNow";
import { Hero } from "../components/header/Hero";
import { HeadsUp } from "../components/headsUp/HeadsUp";
import { AppointmentsThatWeek } from "../components/week/AppointmentsThatWeek";
import { AskedThatWeek } from "../components/week/AskedThatWeek";
import { KeptThatWeek } from "../components/week/KeptThatWeek";
import { Welcome } from "../components/welcome/Welcome";
import { WorthKnowing } from "../components/worthKnowing/WorthKnowing";
import { ThisWeekPageProvider, useThisWeekPage } from "../contexts/ThisWeekPageContext";
import { QuietThisWeekPage } from "../quiet/pages/QuietThisWeekPage";

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
 * While something has happened, none of it: QuietThisWeekPage, support and the next steps instead.
 */
export function ThisWeek() {
  const { data: quiet } = useQuietQuery();
  return quiet ? (
    <QuietThisWeekPage quiet={quiet} />
  ) : (
    <ThisWeekPageProvider>
      <Week />
    </ThisWeekPageProvider>
  );
}

function Week() {
  const { week, peeking, dueDate } = useThisWeekPage();

  return (
    <PillarLayout>
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
          <div className="order-4 empty:hidden lg:order-0">
            <AppointmentsThatWeek />
          </div>
          <div className="order-4 empty:hidden lg:order-0">
            <AskedThatWeek />
          </div>
          <div className="order-4 empty:hidden lg:order-0">
            <KeptThatWeek />
          </div>
          <div className="order-4 empty:hidden lg:order-0">
            <WorthKnowing key={week} />
          </div>
        </div>

        <div className="contents lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-10 lg:flex lg:flex-col lg:gap-8">
          {peeking ? <BestDoneThatWeek /> : <DoingNow />}
        </div>
      </div>
    </PillarLayout>
  );
}
