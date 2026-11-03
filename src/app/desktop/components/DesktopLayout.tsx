import { Link, Outlet } from "@tanstack/react-router";
import { Baby, Settings, Siren } from "lucide-react";
import type { Pillar } from "../../components/layout/AppLayout";
import { CallBirthSuite } from "../../components/layout/CallBirthSuite";
import { PillarNav } from "../../components/layout/PillarNav";
import { CaptureButton } from "../../features/capture/components/CaptureButton";
import { SharedIn } from "../../features/capture/components/SharedIn";
import { ItsTimeWayIn } from "../../features/itsTime/components/wayIn/ItsTimeWayIn";

/**
 * The app on a desktop: a sidebar on the left with the "+" (on the pillars
 * only), the pillars, the call button, It's time (once it's near),
 * Emergency info and settings; the page beside it. Nothing sits under the
 * page, so `--tab-bar` is nothing.
 */
export function DesktopLayout({ pillars, onPillar }: { pillars: readonly Pillar[]; onPillar: boolean }) {
  return (
    <div className="grid grid-cols-[13rem_minmax(0,1fr)] [--tab-bar:0px] print:block">
      <aside className="frame-sidebar sticky top-0 flex h-dvh flex-col border-r border-border-subtle bg-bg-normal px-4 pt-6 pb-4 print:hidden">
        <p className="mb-6 flex items-center gap-2 px-3 text-lg font-semibold text-fg-strong">
          <Baby aria-hidden size={22} className="text-fg-brand" />
          Expecting
        </p>
        {onPillar ? (
          <div className="mb-4">
            <CaptureButton layout="row" />
          </div>
        ) : null}
        <PillarNav pillars={pillars} layout="list" />
        <div className="mt-auto">
          <CallBirthSuite layout="row" />
        </div>
        <ItsTimeWayIn layout="row" />
        <Link
          to="/emergency"
          activeProps={{ "aria-current": "page", className: "bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" }}
          inactiveProps={{ className: "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal" }}
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm"
        >
          <Siren aria-hidden size={18} />
          Emergency info
        </Link>
        <Link
          to="/settings"
          activeProps={{ "aria-current": "page", className: "bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" }}
          inactiveProps={{ className: "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal" }}
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm"
        >
          <Settings aria-hidden size={18} />
          Settings
        </Link>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>

      <SharedIn />
    </div>
  );
}
