import { cn } from "@sixthshift/design-system/utils";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Baby, type LucideIcon, Settings, Siren } from "lucide-react";
import { CaptureButton } from "../../../features/capture/components/CaptureButton";
import type { AppPath } from "../../model/paths";
import { CallBirthSuite } from "./CallBirthSuite";

/** One pillar in the navigation: where it lives (`/planner`) and what it's called. */
export type Pillar = { to: AppPath; label: string; icon: LucideIcon };

/**
 * The layout the pillars are drawn in. Desktop: a sidebar on the left with
 * the pillars, the call button, Emergency info and settings. Phone: a tab bar under the thumb, its height in
 * `--tab-bar` so what sits above it (the timeline's scrubber, the capture
 * "+") can. The "+" is on the pillars only, not on settings or Emergency
 * info: on a desktop at the top of the sidebar, on a phone floating above
 * the tab bar, with room left under each page so it never covers the last row.
 */
export function PillarLayout({ pillars }: { pillars: readonly Pillar[] }) {
  const { pathname } = useLocation();
  const onPillar = pillars.some(({ to }) => pathname === to || (to !== "/" && pathname.startsWith(`${to}/`)));
  return (
    <div className="[--tab-bar:calc(3.75rem+env(safe-area-inset-bottom))] lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:[--tab-bar:0px] print:block">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border-subtle bg-bg-normal px-4 pt-6 pb-4 lg:flex print:hidden">
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

      <div className={cn("min-w-0 pb-(--tab-bar)", onPillar && "max-lg:pb-[calc(var(--tab-bar)+4.5rem)]")}>
        <Outlet />
      </div>

      {onPillar ? (
        <div className="print:hidden">
          <CaptureButton layout="float" />
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 print:hidden border-t border-border-subtle bg-bg-normal/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <PillarNav pillars={pillars} layout="tabs" />
      </div>
    </div>
  );
}

const TAB_COLUMNS: Record<number, string> = { 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" };

function PillarNav({ pillars, layout }: { pillars: readonly Pillar[]; layout: "list" | "tabs" }) {
  const tabs = layout === "tabs";
  return (
    <nav aria-label="Expecting">
      <ul className={tabs ? cn("grid h-15", TAB_COLUMNS[pillars.length]) : "flex flex-col gap-1"}>
        {pillars.map(({ to, label, icon: Icon }, i) => (
          <li key={to}>
            <Link
              to={to}
              // The first pillar is home, `/`, which every other page is under.
              activeOptions={{ exact: i === 0, includeSearch: false }}
              activeProps={{
                "aria-current": "page",
                className: tabs ? "text-fg-brand" : "bg-bg-brand-subtle font-medium text-fg-on-brand-subtle",
              }}
              inactiveProps={{ className: tabs ? "text-fg-subtle" : "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal" }}
              className={cn(
                tabs
                  ? "flex h-full flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium"
                  : "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm"
              )}
            >
              <Icon aria-hidden size={tabs ? 22 : 18} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The top of a pillar's page: its name, and on a phone the call button and the ways to Emergency info and settings (the desktop has them in the sidebar). */
export function PillarHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="flex items-start justify-between gap-3 pt-[max(1.5rem,env(safe-area-inset-top))] pb-5 lg:pt-10 lg:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-display font-semibold text-fg-strong lg:text-3xl">{title}</h1>
        {lead ? <p className="max-w-prose text-fg-subtle">{lead}</p> : null}
      </div>
      <PhoneCorner />
    </header>
  );
}

/** The top corner of a pillar on a phone: the call button, Emergency info, then settings. The desktop has them in the sidebar. */
export function PhoneCorner() {
  return (
    <div className="-mr-2 flex shrink-0 items-center lg:hidden print:hidden">
      <CallBirthSuite layout="icon" />
      <Link to="/emergency" aria-label="Emergency info" className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle">
        <Siren aria-hidden size={20} />
      </Link>
      <Link to="/settings" aria-label="Settings" className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle">
        <Settings aria-hidden size={20} />
      </Link>
    </div>
  );
}
