import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { Appointments } from "../../components/appointments/Appointments";
import { ForNextAppointment } from "../../components/questions/ForNextAppointment";
import { PutAside } from "../components/PutAside";
import { QuietPlannerPageProvider } from "../contexts/QuietPlannerPageContext";

/**
 * The Planner while something has happened, the route's quiet world
 * (`worlds`): nothing to do, the list put aside with what was already set in
 * motion, and no lists to get. The appointments and the questions stay:
 * there are more appointments then, not fewer. What it works out once is
 * `QuietPlannerPageProvider`'s.
 */
export function QuietPlannerPage() {
  return (
    <QuietPlannerPageProvider>
      <PillarLayout title="Planner" lead="Nothing needs doing. What's here is for when you want it.">
        <div className="flex flex-col gap-10 desktop:grid desktop:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] desktop:items-start desktop:gap-10">
          <PutAside />
          <div className="flex flex-col gap-10 desktop:sticky desktop:top-[calc(var(--top-bar)+1.5rem)]">
            <Appointments />
            <ForNextAppointment />
          </div>
        </div>
      </PillarLayout>
    </QuietPlannerPageProvider>
  );
}
