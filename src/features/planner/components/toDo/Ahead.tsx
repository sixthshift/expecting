import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { StageCard } from "./StageCard";

/** What's ahead, as stages: a card each, and the way to the weeks. Without a due date it's all of To do. */
export function Ahead() {
  const { stages, now } = usePlannerPage();
  if (stages.length === 0) return null;
  return (
    <section aria-labelledby="ahead" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 id="ahead" className="text-sm font-semibold text-fg-normal">
          {now === null ? "To do" : "On the horizon"}
        </h3>
        <Link to="/planner/weeks" className="flex min-h-11 items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
          Across the weeks
          <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
      {stages.map((stage) => (
        <StageCard key={stage.end} stage={stage} />
      ))}
    </section>
  );
}
