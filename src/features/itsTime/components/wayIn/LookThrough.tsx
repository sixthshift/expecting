import { Link } from "@tanstack/react-router";
import { ChevronRight, Hourglass } from "lucide-react";
import { useState } from "react";
import { hasLooked } from "../../model/looked";
import { useItsTimeShown } from "./ItsTimeWayIn";

/**
 * On This week once It's time is near, until this phone has opened it: the
 * run-through matters more than the button, so look through it together once,
 * so it's familiar on the night.
 */
export function LookThrough() {
  const { shown, underWay } = useItsTimeShown();
  const [looked] = useState(hasLooked);
  if (!shown || underWay || looked) return null;
  return (
    <Link to="/its-time" className="flex items-start gap-3 rounded-xl border border-border-brand bg-bg-normal p-4 text-fg-normal hover:bg-bg-subtle-hovered">
      <Hourglass aria-hidden size={20} className="mt-0.5 shrink-0 text-fg-brand" />
      <span className="flex flex-col gap-1">
        <span className="font-semibold text-fg-strong">It's time is ready to look at</span>
        <span className="text-sm">The page for the night it starts. Look through it together once, so it's familiar on the night.</span>
      </span>
      <ChevronRight aria-hidden size={18} className="mt-0.5 shrink-0 text-fg-subtle" />
    </Link>
  );
}
