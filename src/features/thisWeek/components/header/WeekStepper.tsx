import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WEEKS, type Week, weekLabel } from "../../../../lib/timeline";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

const STEP = "flex min-h-11 items-center gap-1 rounded-md text-sm text-fg-subtle hover:text-fg-normal";

/** A step to the week before or after, and back to this one when away from it. */
export function WeekStepper() {
  const { week, now } = useThisWeekPage();
  if (week === null || now === null) return null;
  // This week is plain `/`, so it's the URL you'd share.
  const to = (w: Week) => (w === now ? {} : { at: w });
  return (
    <nav aria-label="Weeks" className="-ml-1 flex flex-wrap items-center gap-x-4">
      {week > WEEKS.first ? (
        <Link to="/" search={to(week - 1)} className={STEP}>
          <ChevronLeft aria-hidden size={16} />
          {weekLabel(week - 1)}
        </Link>
      ) : null}
      {week < WEEKS.last ? (
        <Link to="/" search={to(week + 1)} className={STEP}>
          {weekLabel(week + 1)}
          <ChevronRight aria-hidden size={16} />
        </Link>
      ) : null}
      {week !== now ? (
        <Link to="/" search={{}} className="flex min-h-11 items-center rounded-md text-sm font-medium text-fg-brand underline">
          Back to this week
        </Link>
      ) : null}
    </nav>
  );
}
