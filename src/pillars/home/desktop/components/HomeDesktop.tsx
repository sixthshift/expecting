import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { LookThrough } from "../../../../app/features/itsTime/components/wayIn/LookThrough";
import { AskNow } from "../../../../app/features/settings/components/askNow/AskNow";
import { OfferExtra } from "../../../../app/features/settings/components/offerExtra/OfferExtra";
import { formatDate } from "../../../../lib/dates";
import { Calls } from "../../../journal/components/thisWeek/Calls";
import { KeepNow } from "../../../journal/components/thisWeek/KeepNow";
import { CheckIn } from "../../../journal/features/feelings/components/checkIn/CheckIn";
import { HardFortnight } from "../../../journal/features/feelings/components/fortnight/HardFortnight";
import { NextAppointment } from "../../../planner/features/appointments/components/NextAppointment";
import { ComingUp } from "../../../planner/features/tasks/components/comingUp/ComingUp";
import { ToDoNow } from "../../../planner/features/tasks/components/toDoNow/ToDoNow";
import { BestDoneThatWeek } from "../../components/doing/BestDoneThatWeek";
import { QuestionsWaitingNow } from "../../components/doing/QuestionsWaitingNow";
import { WeekHeader } from "../../components/header/WeekHeader";
import { HeadsUp } from "../../components/headsUp/HeadsUp";
import { Part } from "../../components/Part";
import { AppointmentsThatWeek } from "../../components/week/AppointmentsThatWeek";
import { AskedThatWeek } from "../../components/week/AskedThatWeek";
import { KeptThatWeek } from "../../components/week/KeptThatWeek";
import { WorthKnowing } from "../../components/worthKnowing/WorthKnowing";
import { useHomePage } from "../../contexts/HomePageContext";
import { WeeklyCard } from "../../features/weekly/components/WeeklyCard";
import { DayTabs } from "./DayTabs";

/**
 * Home on a desktop: the dashboard over every pillar, as Now and The
 * week side by side, Now the larger share.
 *
 * - A call to make, when there is one, above everything (the Journal's
 *   `Calls`: a movement kept as different lately, or can't keep fluids down).
 * - Now, on the left: what's due, by where it comes from. To do, from the
 *   Planner (It's time's look through once near, the next appointment once
 *   close, to do now, what Expecting needs to know), and To keep, for the
 *   Journal: what's asked rather than looked for (how you are today, the
 *   firsts around now, the places ready, the week's question). What's coming
 *   follows. A peek has what was best done that week instead.
 * - The week, on the right: where you are (the week, its size, the whole
 *   pregnancy in a line), then To read, from the Library: the day by day as
 *   tabs, the heads-up, what's worth knowing (by title); and a peek's
 *   appointments and what was asked and kept.
 *
 * Now's groups sit side by side once it's wide enough (do · keep, with the
 * week beside: three columns), one under the other below that. The week is
 * first in the page's order, so its heading is the page's; it's drawn on the
 * right. The page grows to 1760px (`width="full"`).
 */
export function HomeDesktop() {
  const { peeking, week, today } = useHomePage();
  return (
    <PillarLayout width="full">
      <div className="flex flex-col gap-6">
        <div className="pt-8 empty:hidden">
          <Calls />
        </div>
        <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-10">
          <div className="col-start-2 row-start-1 flex flex-col gap-8 border-l border-border-subtle pl-10">
            <WeekHeader />
            <Group label="To read" from="from the Library" to="/library">
              <Part>
                <DayTabs key={week} />
              </Part>
              <Part>
                <HeadsUp />
              </Part>
              <Part>
                <WorthKnowing key={week} brief />
              </Part>
            </Group>
            <Part>
              <AppointmentsThatWeek />
            </Part>
            <Part>
              <AskedThatWeek />
            </Part>
            <Part>
              <KeptThatWeek />
            </Part>
          </div>

          <div className="@container col-start-1 row-start-1 flex flex-col gap-6 pt-10">
            {peeking ? (
              <BestDoneThatWeek />
            ) : (
              <>
                <p className="flex flex-col">
                  <span className="text-xs font-semibold tracking-widest text-fg-subtle uppercase">Now</span>
                  <span className="text-3xl font-display font-semibold text-fg-strong">
                    {formatDate(today, { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                </p>
                <div className="grid items-start gap-x-8 gap-y-8 [grid-template-areas:'do'_'keep'_'ahead'] @min-[56rem]:grid-cols-2 @min-[56rem]:[grid-template-areas:'do_keep'_'ahead_keep']">
                  <div className="[grid-area:do]">
                    <Group label="To do" from="from the Planner" to="/planner">
                      <Part>
                        <LookThrough />
                      </Part>
                      <Part>
                        <NextAppointment />
                      </Part>
                      <div>
                        <ToDoNow />
                      </div>
                      <Part>
                        <AskNow />
                      </Part>
                    </Group>
                  </div>
                  <div className="[grid-area:keep]">
                    <Group label="To keep" from="for the Journal" to="/journal">
                      <Part>
                        <CheckIn />
                      </Part>
                      <Part>
                        <HardFortnight />
                      </Part>
                      <KeepNow />
                      <Part>
                        <WeeklyCard />
                      </Part>
                    </Group>
                  </div>
                  <div className="flex flex-col gap-8 [grid-area:ahead]">
                    <Part>
                      <ComingUp />
                    </Part>
                    <QuestionsWaitingNow />
                    <Part>
                      <OfferExtra />
                    </Part>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PillarLayout>
  );
}

/** One pillar's share of the board: its label, where it comes from, and the way to the pillar; then its parts. */
function Group({ label, from, to, children }: { label: string; from: string; to: "/planner" | "/journal" | "/library"; children: ReactNode }) {
  return (
    <section aria-label={`${label}, ${from}`} className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-border-brand pb-1.5">
        <p className="text-xs font-semibold tracking-widest text-fg-strong uppercase">
          {label} <span className="text-fg-subtle">· {from}</span>
        </p>
        <Link to={to} className="flex items-center gap-0.5 text-xs font-medium text-fg-brand hover:underline">
          {to === "/planner" ? "Planner" : to === "/journal" ? "Journal" : "Library"}
          <ChevronRight aria-hidden size={14} />
        </Link>
      </div>
      {children}
    </section>
  );
}
