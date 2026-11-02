import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { Appointments } from "../components/appointments/Appointments";
import { ForNextAppointment } from "../components/questions/ForNextAppointment";
import { PutAside } from "../components/quiet/PutAside";
import { ToDo } from "../components/toDo/ToDo";
import { PlannerPageProvider, usePlannerPage } from "../contexts/PlannerPageContext";
import { ListsWayIn } from "../features/lists/components/wayIn/ListsWayIn";

/**
 * What to do and what to ask. To do starts somewhere: the one thing to do
 * next, then the rest of what to do now, with what's ahead, missed and done
 * folded away (src/lib/planner/plan.ts). Beside it, the lists (what to get),
 * the appointments, and the questions for the next one. While something has
 * happened, nothing to do: the list is put aside, with what was already set
 * in motion. The plan and the appointments are worked out once, in
 * `PlannerPageProvider`; each part reads it.
 */
export function PlannerPage() {
  return (
    <PlannerPageProvider>
      <Planner />
    </PlannerPageProvider>
  );
}

function Planner() {
  const { quiet } = usePlannerPage();
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader
        title="Planner"
        lead={quiet ? "Nothing needs doing. What's here is for when you want it." : "What to do and what to ask, so nothing sneaks up on you."}
      />
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-10">
        {quiet ? <PutAside /> : <ToDo />}
        <div className="flex flex-col gap-10 lg:sticky lg:top-6">
          {quiet ? null : <ListsWayIn />}
          <Appointments />
          <ForNextAppointment />
        </div>
      </div>
    </main>
  );
}
