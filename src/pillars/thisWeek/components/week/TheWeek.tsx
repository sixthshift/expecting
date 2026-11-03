import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { DayByDay } from "../dayByDay/DayByDay";
import { HeadsUp } from "../headsUp/HeadsUp";
import { Part } from "../Part";
import { WorthKnowing } from "../worthKnowing/WorthKnowing";
import { AppointmentsThatWeek } from "./AppointmentsThatWeek";
import { AskedThatWeek } from "./AskedThatWeek";
import { KeptThatWeek } from "./KeptThatWeek";

/** The week to read: the day by day (its note, then a read a day) and its heads-up. */
export function WeekReads() {
  const { week } = useThisWeekPage();
  return (
    <>
      <Part>
        <DayByDay key={week} />
      </Part>
      <Part>
        <HeadsUp />
      </Part>
    </>
  );
}

/** What's in the week: a peek's appointments, what was asked and kept then, and what's worth knowing as it starts. */
export function WeekKept() {
  const { week } = useThisWeekPage();
  return (
    <>
      <Part>
        <AppointmentsThatWeek />
      </Part>
      <Part>
        <AskedThatWeek />
      </Part>
      <Part>
        <KeptThatWeek />
      </Part>
      <Part>
        <WorthKnowing key={week} />
      </Part>
    </>
  );
}
