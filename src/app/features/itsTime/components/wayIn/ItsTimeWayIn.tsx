import { Link } from "@tanstack/react-router";
import { Hourglass } from "lucide-react";
import { useItsTimeShown } from "../../hooks/useItsTimeShown";

/**
 * The way to It's time, beside Emergency info once it's near: a labelled pill,
 * in a phone's top corner and in the desktop's top bar (on the night you
 * shouldn't have to work out what an icon means). Strong while a start is
 * under way, so the way back is the first thing seen.
 */
export function ItsTimeWayIn() {
  const { shown, underWay } = useItsTimeShown();
  if (!shown) return null;
  return (
    <Link
      to="/its-time"
      className={
        underWay
          ? "mr-1 flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-bg-brand-strong px-3 text-sm font-semibold whitespace-nowrap text-fg-on-brand-strong"
          : "mr-1 flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-border-brand px-3 text-sm font-medium whitespace-nowrap text-fg-brand"
      }
    >
      <Hourglass aria-hidden size={14} />
      It's time
    </Link>
  );
}
