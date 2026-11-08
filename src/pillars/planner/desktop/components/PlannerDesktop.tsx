import { useSettingsQuery } from "../../../../api/rpc/settings";
import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { Appointments } from "../../components/appointments/Appointments";
import { QuestionsSection } from "../../components/questions/Questions";
import { Ahead } from "../../components/toDo/Ahead";
import { ToDo } from "../../components/toDo/ToDo";
import { UpNext } from "../../components/upNext/UpNext";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { PlannerRail } from "./PlannerRail";
import { ToGet } from "./ToGet";

/**
 * The Planner on a desktop: Up next, appointments and tasks in one running
 * order a week at a time, the next appointment with its questions; beside it
 * what's still to get (the lists, which have no dates) and the stages on the
 * horizon, a column each on a wide screen. The page grows to 1760px
 * (`width="full"`), Up next with it only so far as its rows stay readable.
 * The same plan the phone's page draws, in `PlannerPageProvider`.
 * Without a due date there's no now to run from: To do, everything ahead,
 * with the lists, appointments and questions beside it.
 */
export function PlannerDesktop() {
  const { now } = usePlannerPage();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate ?? null });
  if (now === null || !dueDate) return <NoDueDate />;
  return (
    <PillarLayout rail={<PlannerRail />} width="full" title="Planner" lead="What to do and what to ask, so nothing sneaks up on you.">
      {/* The page takes the width, not the list: Up next keeps a row's when near its title, and what's
          beside it gets the room, To get and On the horizon a column each once there's space for three. */}
      <div className="@container">
        <div className="grid grid-cols-[minmax(0,1fr)_24rem] items-start gap-10 @min-[88rem]:grid-cols-[minmax(0,1fr)_22rem_22rem]">
          <UpNext now={now} dueDate={dueDate} />
          <div className="flex flex-col gap-10 @min-[88rem]:contents">
            <ToGet />
            <Ahead />
          </div>
        </div>
      </div>
    </PillarLayout>
  );
}

/** Before there's a due date: To do (everything ahead), and beside it the lists, the appointments and the questions. */
function NoDueDate() {
  return (
    <PillarLayout rail={<PlannerRail />} title="Planner" lead="What to do and what to ask, so nothing sneaks up on you.">
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-10">
        <ToDo />
        <div className="sticky top-[calc(var(--top-bar)+1.5rem)] flex flex-col gap-10">
          <ToGet />
          <Appointments />
          <QuestionsSection />
        </div>
      </div>
    </PillarLayout>
  );
}
