import { useQuestionsQuery } from "../../../../api/rpc/questions";
import { askedWeeks } from "../../../../lib/thisWeek/timelineWeeks";
import { AskedQuestion } from "../../../planner/features/questions/components/AskedQuestion";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { whichWeek } from "../../model/labels";

/** The questions asked at an appointment in the week shown, this one or a peek's. */
export function AskedThatWeek() {
  const { week, peeking, dueDate } = useThisWeekPage();
  const { data: questions } = useQuestionsQuery();
  const askedIn = askedWeeks(questions, dueDate);
  const asked = questions.filter((q) => week !== null && askedIn.get(q.id) === week);
  if (asked.length === 0) return null;
  return (
    <section aria-labelledby="asked" className="flex flex-col gap-2">
      <h2 id="asked" className="text-lg font-display font-semibold text-fg-strong">
        {`Asked ${whichWeek(peeking)}`}
      </h2>
      {asked.map((q) => (
        <AskedQuestion key={q.id} question={q} />
      ))}
    </section>
  );
}
