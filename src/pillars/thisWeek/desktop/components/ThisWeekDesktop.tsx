import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { LookThrough } from "../../../../app/features/itsTime/components/wayIn/LookThrough";
import { AskNow } from "../../../../app/features/settings/components/askNow/AskNow";
import { OfferExtra } from "../../../../app/features/settings/components/offerExtra/OfferExtra";
import { CheckIn } from "../../../journal/features/feelings/components/checkIn/CheckIn";
import { HardFortnight } from "../../../journal/features/feelings/components/fortnight/HardFortnight";
import { NextAppointment } from "../../../planner/features/appointments/components/NextAppointment";
import { ComingUp } from "../../../planner/features/tasks/components/comingUp/ComingUp";
import { ToDoNow } from "../../../planner/features/tasks/components/toDoNow/ToDoNow";
import { BestDoneThatWeek } from "../../components/doing/BestDoneThatWeek";
import { QuestionsWaitingNow } from "../../components/doing/DoingNow";
import { WeekHeader } from "../../components/header/WeekHeader";
import { HeadsUp } from "../../components/headsUp/HeadsUp";
import { Part } from "../../components/Part";
import { AppointmentsThatWeek } from "../../components/week/AppointmentsThatWeek";
import { AskedThatWeek } from "../../components/week/AskedThatWeek";
import { KeptThatWeek } from "../../components/week/KeptThatWeek";
import { WorthKnowing } from "../../components/worthKnowing/WorthKnowing";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { WeeklyCard } from "../../features/weekly/components/WeeklyCard";
import { DayTabs } from "./DayTabs";

/**
 * This week on a desktop, a board: its parts side by side rather than down
 * the page, so most of the week is on one screen.
 *
 * - Across the top, where you are (the week, its size, the whole pregnancy in
 *   a line, which is better wide), with the next appointment beside it once
 *   it's close.
 * - The week to read: its note and a read a day as tabs (`DayTabs`), at a
 *   reading width, then its heads-up.
 * - What to do now: It's time's look through once it's near, to do, how you
 *   are, what's coming, the questions waiting; or on a peek, what was best
 *   done that week.
 * - The week's other things: what's worth knowing (by title), the week's
 *   question, what Expecting needs to know, a peek's appointments, what was
 *   asked and kept, an extra to offer.
 *
 * Three columns where the page is wide enough (the doing, the reading, the
 * rest); two below that, the rest under the reading and the doing beside
 * them. The page itself grows to 1760px (`width="full"`).
 */
export function ThisWeekDesktop() {
  const { peeking, week } = useThisWeekPage();
  return (
    <PillarLayout width="full">
      <div className="@container">
        <div className="mb-8 flex items-end gap-8">
          <div className="min-w-0 flex-1">
            <WeekHeader />
          </div>
          {peeking ? null : (
            <div className="w-[23.75rem] shrink-0 empty:hidden @min-[94rem]:w-[26.25rem]">
              <NextAppointment />
            </div>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_23.75rem] items-start gap-8 [grid-template-areas:'read_do'_'know_do'] @min-[94rem]:grid-cols-[24rem_minmax(0,45rem)_minmax(0,1fr)] @min-[94rem]:[grid-template-areas:'do_read_know']">
          <div className="flex flex-col gap-8 [grid-area:read]">
            <Part>
              <DayTabs key={week} />
            </Part>
            <Part>
              <HeadsUp />
            </Part>
          </div>

          <div className="flex flex-col gap-8 [grid-area:do]">
            {peeking ? (
              <BestDoneThatWeek />
            ) : (
              <>
                <Part>
                  <LookThrough />
                </Part>
                <div>
                  <ToDoNow />
                </div>
                <Part>
                  <HardFortnight />
                </Part>
                <Part>
                  <CheckIn />
                </Part>
                <Part>
                  <ComingUp />
                </Part>
                <QuestionsWaitingNow />
              </>
            )}
          </div>

          <div className="flex flex-col gap-8 [grid-area:know]">
            <Part>
              <WorthKnowing key={week} brief />
            </Part>
            {peeking ? null : (
              <>
                <Part>
                  <WeeklyCard />
                </Part>
                <Part>
                  <AskNow />
                </Part>
              </>
            )}
            <Part>
              <AppointmentsThatWeek />
            </Part>
            <Part>
              <AskedThatWeek />
            </Part>
            <Part>
              <KeptThatWeek />
            </Part>
            {peeking ? null : (
              <Part>
                <OfferExtra />
              </Part>
            )}
          </div>
        </div>
      </div>
    </PillarLayout>
  );
}
