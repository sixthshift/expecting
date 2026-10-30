import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PillarHeader } from "../../../../app/components/layout/PillarLayout";
import { type Week, weekLabel } from "../../../../lib/timeline";

/**
 * The timeline while something has happened: paused at its week, the weeks
 * and windows put away. Nothing in it moves on until you choose; what it held
 * is still in the Library.
 */
export function Paused({ week }: { week: Week | null }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 md:px-8">
      <PillarHeader title="Timeline" />
      <div className="flex flex-col gap-3">
        <p className="max-w-prose text-fg-normal">
          The timeline is paused{week === null ? "" : ` at ${weekLabel(week).toLowerCase()}`}. The weeks are put away, and nothing here moves on until you
          choose.
        </p>
        <Link to="/" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
          Someone to talk to, and what comes next
          <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
    </main>
  );
}
