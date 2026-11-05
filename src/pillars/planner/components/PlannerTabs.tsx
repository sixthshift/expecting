import { useLocation } from "@tanstack/react-router";
import { BarTabs } from "../../../app/mobile/components/BarTabs";

/**
 * The Planner's places as tabs in the bar on a phone (`PillarLayout`'s
 * `tabs`): Up next (`/planner`), the lists, the appointments and the
 * questions, each its own page and address. A list opened is under Lists. A
 * desktop has the same places on the Planner's rail (`PlannerRail`).
 */
export function PlannerTabs() {
  const { pathname } = useLocation();
  return (
    <BarTabs
      label="Planner"
      tabs={[
        { to: "/planner", label: "Up next", current: pathname === "/planner" },
        { to: "/planner/lists", label: "Lists", current: pathname.startsWith("/planner/lists") },
        { to: "/planner/appointments", label: "Appointments", current: pathname === "/planner/appointments" },
        { to: "/planner/questions", label: "Questions", current: pathname === "/planner/questions" },
      ]}
    />
  );
}
