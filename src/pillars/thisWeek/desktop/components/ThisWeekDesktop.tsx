import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { BestDoneThatWeek } from "../../components/doing/BestDoneThatWeek";
import { DoingNow } from "../../components/doing/DoingNow";
import { WeekHeader } from "../../components/header/WeekHeader";
import { WeekKept, WeekReads } from "../../components/week/TheWeek";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

/**
 * This week on a desktop: two columns. On the left where you are, then the
 * week, to read and what's in it; on the right, from the top and staying in
 * view, the doing (or a peek's best done that week).
 */
export function ThisWeekDesktop() {
  const { peeking } = useThisWeekPage();
  return (
    <PillarLayout>
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-10">
        <div className="flex flex-col gap-10">
          <WeekHeader />
          <div className="flex flex-col gap-8">
            <WeekReads />
            <WeekKept />
          </div>
        </div>
        <div className="sticky top-6 mt-10 flex flex-col gap-8">{peeking ? <BestDoneThatWeek /> : <DoingNow />}</div>
      </div>
    </PillarLayout>
  );
}
