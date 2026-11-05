import { useSettingsQuery } from "../../../../api/rpc/settings";
import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { PlannerTabs } from "../../components/PlannerTabs";
import { Ahead } from "../../components/toDo/Ahead";
import { ToDo } from "../../components/toDo/ToDo";
import { UpNext } from "../../components/upNext/UpNext";
import { usePlannerPage } from "../../contexts/PlannerPageContext";

/**
 * The Planner on a phone, its first tab (`PlannerTabs`): Up next,
 * appointments and tasks a week at a time, the next appointment with its
 * questions, as on a desktop; then the stages on the horizon. The lists, all
 * the appointments and all the questions are the other tabs. Without a due
 * date there's no now to run from: To do, everything ahead.
 */
export function PlannerMobile() {
  const { now } = usePlannerPage();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate ?? null });
  return (
    <PillarLayout tabs={{ title: "Planner", nav: <PlannerTabs /> }} title="Planner">
      {now === null || !dueDate ? (
        <ToDo />
      ) : (
        <div className="flex flex-col gap-10">
          <UpNext now={now} dueDate={dueDate} phone />
          <Ahead />
        </div>
      )}
    </PillarLayout>
  );
}
