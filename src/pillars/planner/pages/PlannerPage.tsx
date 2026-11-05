import { useLayout } from "../../../app/hooks/useLayout";
import { PlannerPageProvider } from "../contexts/PlannerPageContext";
import { PlannerDesktop } from "../desktop/components/PlannerDesktop";
import { PlannerMobile } from "../mobile/components/PlannerMobile";

/**
 * The Planner, at `/planner`: what to do and what to ask. Up next,
 * appointments and tasks in one running order a week at a time, the next
 * appointment with its questions (src/lib/planner/upNext.ts). On a desktop
 * the lists and the stages on the horizon beside it (`PlannerDesktop`); on a
 * phone the horizon under it, and the lists, the appointments and the
 * questions in tabs of their own (`PlannerMobile`, `PlannerTabs`). The plan is
 * worked out once, in `PlannerPageProvider`; each part reads it. While
 * something has happened, the route draws `QuietPlannerPage` instead
 * (`worlds`), in its own context.
 */
export function PlannerPage() {
  return <PlannerPageProvider>{useLayout() === "desktop" ? <PlannerDesktop /> : <PlannerMobile />}</PlannerPageProvider>;
}
