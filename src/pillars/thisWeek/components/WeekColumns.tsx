import { PhoneCorner } from "../../../app/components/layout/AppLayout";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { useThisWeekPage } from "../contexts/ThisWeekPageContext";
import { DayByDay } from "./dayByDay/DayByDay";
import { BestDoneThatWeek } from "./doing/BestDoneThatWeek";
import { DoingNow } from "./doing/DoingNow";
import { Hero } from "./header/Hero";
import { HeadsUp } from "./headsUp/HeadsUp";
import { AppointmentsThatWeek } from "./week/AppointmentsThatWeek";
import { AskedThatWeek } from "./week/AskedThatWeek";
import { KeptThatWeek } from "./week/KeptThatWeek";
import { Welcome } from "./welcome/Welcome";
import { WorthKnowing } from "./worthKnowing/WorthKnowing";

/**
 * This week's page, inside `ThisWeekPageProvider` (`ThisWeekPage`): on a phone
 * one column in `order`, the week's header first; on a desktop the header and
 * the week on the left, the doing on the right.
 */
export function WeekColumns() {
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
