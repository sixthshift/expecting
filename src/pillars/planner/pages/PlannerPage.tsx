import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { Appointments } from "../components/appointments/Appointments";
import { ForNextAppointment } from "../components/questions/ForNextAppointment";
import { ToDo } from "../components/toDo/ToDo";
import { PlannerPageProvider } from "../contexts/PlannerPageContext";
import { PlannerRail } from "../desktop/components/PlannerRail";
import { ListsWayIn } from "../features/lists/components/wayIn/ListsWayIn";

/**
 * The Planner, at `/planner`: what to do and what to ask. To do starts
 * somewhere: the one thing to do next, then the rest of what to do now, with
 * what's ahead, missed and done folded away (src/lib/planner/plan.ts). Beside
 * it, the lists (what to get), the appointments, and the questions for the
 * next one. The plan is worked out once, in `PlannerPageProvider`; each part
 * reads it. While something has happened, the route draws `QuietPlannerPage`
 * instead (`worlds`), in its own context.
 */
export function PlannerPage() {
  return (
    <PlannerPageProvider>
      <PillarLayout rail={<PlannerRail />} title="Planner" lead="What to do and what to ask, so nothing sneaks up on you.">
        <div className="flex flex-col gap-10 desktop:grid desktop:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] desktop:items-start desktop:gap-10">
          <ToDo />
          <div className="flex flex-col gap-10 desktop:sticky desktop:top-[calc(var(--top-bar)+1.5rem)]">
            <ListsWayIn />
            <Appointments />
            <ForNextAppointment />
          </div>
        </div>
      </PillarLayout>
    </PlannerPageProvider>
  );
}
