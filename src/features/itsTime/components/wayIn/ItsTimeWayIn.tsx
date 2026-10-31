import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Hourglass } from "lucide-react";
import { answersQuery } from "../../../../api/rpc/facts";
import { itsTimeQuery } from "../../../../api/rpc/itsTime";
import { quietQuery } from "../../../../api/rpc/quiet";
import { settingsQuery } from "../../../../api/rpc/settings";
import { todayISO } from "../../../../lib/dates";
import { factsOf } from "../../../../lib/facts";
import { itsTimeShown, openStart } from "../../../../lib/itsTime";
import { positionOn } from "../../../../lib/timeline";

/** Whether the way in is drawn: from week 36 (32 for twins or more), or while a start is under way; never while something has happened. Read without suspense: the frame never waits for it. */
export function useItsTimeShown(): { shown: boolean; underWay: boolean } {
  const { data: itsTime } = useQuery(itsTimeQuery);
  const { data: quiet } = useQuery(quietQuery);
  const { data: answers } = useQuery(answersQuery);
  const { data: settings } = useQuery(settingsQuery);
  const underWay = Boolean(itsTime && openStart(itsTime));
  const now = settings?.dueDate ? positionOn(todayISO(), settings.dueDate).week : null;
  const shown = itsTimeShown({ now, facts: answers ? factsOf(answers) : {}, quiet: Boolean(quiet), open: underWay });
  return { shown, underWay };
}

/**
 * The way to It's time, beside Emergency info once it's near: on a phone a
 * labelled pill in the corner (on the night you shouldn't have to work out what
 * an icon means), on a desktop a row in the sidebar. Strong while a start is
 * under way, so the way back is the first thing seen.
 */
export function ItsTimeWayIn({ layout }: { layout: "pill" | "row" }) {
  const { shown, underWay } = useItsTimeShown();
  if (!shown) return null;
  if (layout === "pill") {
    return (
      <Link
        to="/its-time"
        className={
          underWay
            ? "mr-1 flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-bg-brand-strong px-3 text-sm font-semibold text-fg-on-brand-strong"
            : "mr-1 flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-border-brand px-3 text-sm font-medium text-fg-brand"
        }
      >
        <Hourglass aria-hidden size={14} />
        It's time
      </Link>
    );
  }
  return (
    <Link
      to="/its-time"
      activeProps={{ "aria-current": "page", className: "bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" }}
      inactiveProps={{
        className: underWay ? "font-semibold text-fg-brand hover:bg-bg-subtle-hovered" : "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal",
      }}
      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm"
    >
      <Hourglass aria-hidden size={18} className="text-fg-brand" />
      It's time
    </Link>
  );
}
