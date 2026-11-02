import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { weekInSentence } from "../../../../lib/labels";
import type { Week } from "../../../../lib/timeline";
import { TimelineFrame } from "../TimelineFrame";

/**
 * The timeline while something has happened: paused at its week, the weeks
 * and windows put away. Nothing in it moves on until you choose; what it held
 * is still in the Library.
 */
export function Paused({ week }: { week: Week | null }) {
  return (
    <TimelineFrame>
      <div className="flex max-w-3xl flex-col gap-3">
        <p className="max-w-prose text-fg-normal">
          The weeks are paused{week === null ? "" : ` at ${weekInSentence(week)}`}. They're put away, and nothing here moves on until you choose.
        </p>
        <Link to="/" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
          Someone to talk to, and what comes next
          <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
    </TimelineFrame>
  );
}
