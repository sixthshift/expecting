import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { Calls } from "../../../journal/components/thisWeek/Calls";
import { KeepNow } from "../../../journal/components/thisWeek/KeepNow";
import { BestDoneThatWeek } from "../../components/doing/BestDoneThatWeek";
import { DoingAhead, DoingAsked, DoingFirst } from "../../components/doing/DoingNow";
import { WeekHeader } from "../../components/header/WeekHeader";
import { WeekKept, WeekReads } from "../../components/week/TheWeek";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

/**
 * This week on a phone: one column, the doing first. Where you are, a call
 * to make if there is one, what to do now and how you are, what's worth
 * keeping now (the firsts around now, the places ready); then the week to read; what's asked of you; what's
 * in the week; and what's ahead. A peek has what was best done that week in
 * place of the doing.
 */
export function ThisWeekMobile() {
  const { peeking } = useThisWeekPage();
  return (
    <PillarLayout>
      <div className="flex flex-col gap-8">
        <WeekHeader />
        <Calls />
        {peeking ? <BestDoneThatWeek /> : <DoingFirst />}
        {peeking ? null : <KeepNow />}
        <WeekReads />
        {peeking ? null : <DoingAsked />}
        <WeekKept />
        {peeking ? null : <DoingAhead />}
      </div>
    </PillarLayout>
  );
}
