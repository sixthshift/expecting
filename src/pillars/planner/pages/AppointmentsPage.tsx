import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { Appointments } from "../components/appointments/Appointments";
import { PlannerTabs } from "../components/PlannerTabs";
import { PlannerRail } from "../desktop/components/PlannerRail";

/** The appointments, at `/planner/appointments`: the next given room, the rest still ahead, a way to add one, those been folded away. A tab on a phone, a place on the rail on a desktop. */
export function AppointmentsPage() {
  return (
    <PillarLayout
      rail={<PlannerRail />}
      tabs={{ title: "Planner", nav: <PlannerTabs /> }}
      title="Appointments"
      lead="Each one booked, with where and when, and a way into your calendar."
    >
      <Appointments quietHeading />
    </PillarLayout>
  );
}
