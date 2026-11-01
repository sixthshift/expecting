import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { type Week, weekLabel } from "../../../../lib/timeline";
import { MapHeader } from "../header/MapHeader";

/**
 * The map while something has happened: paused at its week, the weeks
 * and windows put away. Nothing in it moves on until you choose; what it held
 * is still in the Library.
 */
export function Paused({ week }: { week: Week | null }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
      <div className="max-w-3xl">
        <MapHeader />
        <div className="flex flex-col gap-3">
          <p className="max-w-prose text-fg-normal">
            The weeks are paused{week === null ? "" : ` at ${weekLabel(week).toLowerCase()}`}. They're put away, and nothing here moves on until you choose.
          </p>
          <Link to="/" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
            Someone to talk to, and what comes next
            <ChevronRight aria-hidden size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
