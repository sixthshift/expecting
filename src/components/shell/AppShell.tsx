import { cn } from "@sixthshift/design-system/utils";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { BookOpen, CalendarRange, ListChecks, NotebookPen, Settings, ToyBrick, Wrench } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useExpectingTheme } from "../../lib/theme";
import { useApp } from "../app";
import { ContentContext } from "../content/context";

/**
 * The pillars. The timeline is the thread through the other four: what the
 * Library explains, the Planner asks of you and the Journal keeps all meet on
 * their week.
 */
export const PILLARS = [
  { to: "/", label: "Timeline", icon: CalendarRange },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/planner", label: "Planner", icon: ListChecks },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/toolkit", label: "Toolkit", icon: Wrench },
] as const;

/**
 * The frame around every pillar. Desktop: a sidebar on the left with the
 * pillars and settings. Phone: a tab bar under the thumb, its height in
 * `--tab-bar` so what sits above it (the timeline's scrubber) can.
 */
export function AppShell() {
  const { state, questions, now, nowKey } = useApp();
  useExpectingTheme(state.household.baby);
  const { pathname } = useLocation();

  // A new pillar starts at its top; the timeline places itself (this week, or ?at=).
  useEffect(() => {
    if (pathname !== "/") window.scrollTo(0, 0);
  }, [pathname]);

  const profile = state.household.profile;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `now` is a new object each render; its key says when it moved.
  const content = useMemo(() => ({ profile, now, openQuestions: questions.filter((q) => !q.askedAt).map((q) => q.text) }), [profile, nowKey, questions]);

  return (
    <div className="[--tab-bar:calc(3.75rem+env(safe-area-inset-bottom))] lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:[--tab-bar:0px]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border-subtle bg-bg-normal px-4 pt-6 pb-4 lg:flex">
        <p className="mb-6 flex items-center gap-2 px-3 text-lg font-semibold text-fg-strong">
          <ToyBrick aria-hidden size={22} className="text-fg-brand" />
          Expecting
        </p>
        <PillarNav layout="list" />
        <Link
          to="/settings"
          activeProps={{ "aria-current": "page", className: "bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" }}
          inactiveProps={{ className: "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal" }}
          className="mt-auto flex min-h-11 items-center gap-3 rounded-md px-3 text-sm"
        >
          <Settings aria-hidden size={18} />
          Settings
        </Link>
      </aside>

      <ContentContext.Provider value={content}>
        <div className="min-w-0 pb-(--tab-bar)">
          <Outlet />
        </div>
      </ContentContext.Provider>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-bg-normal/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <PillarNav layout="tabs" />
      </div>
    </div>
  );
}

function PillarNav({ layout }: { layout: "list" | "tabs" }) {
  const tabs = layout === "tabs";
  return (
    <nav aria-label="Expecting">
      <ul className={tabs ? "grid h-15 grid-cols-5" : "flex flex-col gap-1"}>
        {PILLARS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/", includeSearch: false }}
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

/** The top of a pillar's page: its name, and on a phone the way to settings (the desktop has it in the sidebar). */
export function PillarHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className="flex items-start justify-between gap-3 pt-[max(1.5rem,env(safe-area-inset-top))] pb-5 lg:pt-10 lg:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-fg-strong lg:text-3xl">{title}</h1>
        {lead ? <p className="max-w-prose text-fg-subtle">{lead}</p> : null}
      </div>
      <Link to="/settings" aria-label="Settings" className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle lg:hidden">
        <Settings aria-hidden size={20} />
      </Link>
    </header>
  );
}
