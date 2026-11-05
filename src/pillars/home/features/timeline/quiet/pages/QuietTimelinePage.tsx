import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useQuietQuery } from "../../../../../../api/rpc/quiet";
import { useSettingsQuery } from "../../../../../../api/rpc/settings";
import { PillarLayout } from "../../../../../../app/components/layout/PillarLayout";
import { pausedAt } from "../../../../../../lib/home/quiet";
import { weekInSentence } from "../../../../../../lib/labels";

/**
 * The timeline while something has happened: paused at its week, the weeks
 * and windows put away. Nothing in it moves on until you choose; what it held
 * is still in the Library. The route's quiet world (`worlds`).
 */
export function QuietTimelinePage() {
  const { data: quiet } = useQuietQuery();
  const { data: settings } = useSettingsQuery();
  // Only once it's lifted, before the route draws the other world.
  if (!quiet) return null;
  const week = pausedAt(quiet, settings.dueDate);
  return (
    <PillarLayout back={{ to: "/", label: "Home" }} title="The whole pregnancy">
      <div className="flex max-w-3xl flex-col gap-3">
        <p className="max-w-prose text-fg-normal">
          The weeks are paused{week === null ? "" : ` at ${weekInSentence(week)}`}. They're put away, and nothing here moves on until you choose.
        </p>
        <Link to="/" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
          Someone to talk to, and what comes next
          <ChevronRight aria-hidden size={16} />
        </Link>
      </div>
    </PillarLayout>
  );
}
