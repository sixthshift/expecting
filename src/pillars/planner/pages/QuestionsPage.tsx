import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { PlannerTabs } from "../components/PlannerTabs";
import { QuestionsSection } from "../components/questions/Questions";
import { PlannerRail } from "../desktop/components/PlannerRail";

/** The questions, at `/planner/questions`: those for the next appointment, a way to add one, and those asked folded away. A tab on a phone, a place on the rail on a desktop. */
export function QuestionsPage() {
  return (
    <PillarLayout
      rail={<PlannerRail />}
      tabs={{ title: "Planner", nav: <PlannerTabs /> }}
      title="Questions"
      lead="What to ask at the next appointment, there to tick off in the waiting room."
    >
      <QuestionsSection />
    </PillarLayout>
  );
}
