import { cn } from "@sixthshift/design-system/utils";
import { Link, type LinkProps } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import type { AppPath } from "../../model/paths";

/** One of a pillar's places, as a tab: where it goes, what it's called, whether it's the one open. */
export type BarTab = { to: AppPath; params?: LinkProps["params"]; label: string; current: boolean };

/**
 * A pillar's places as tabs along the bottom of the bar at the top of a phone
 * (`MobileBar`): the Journal's story and collections, the Planner's up next,
 * lists, appointments and questions. Links, so each is its own address, back
 * goes between them, and a desktop has the same places on the pillar's rail.
 * The one open is underlined and `aria-current`; they scroll sideways if
 * there's no room, the open one brought into view.
 */
export function BarTabs({ label, tabs }: { label: string; tabs: readonly BarTab[] }) {
  const nav = useRef<HTMLElement>(null);
  const open = tabs.find((t) => t.current)?.label;
  // biome-ignore lint/correctness/useExhaustiveDependencies: brings the open tab into view as it changes
  useEffect(() => {
    const tab = nav.current?.querySelector<HTMLElement>("[aria-current=page]");
    if (nav.current && tab) nav.current.scrollLeft = tab.offsetLeft - nav.current.offsetLeft - 16;
  }, [open]);
  return (
    <nav ref={nav} aria-label={label} className="scrollbar-none -mb-px flex gap-5 overflow-x-auto pr-2 print:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          to={tab.to}
          params={tab.params}
          aria-current={tab.current ? "page" : undefined}
          className={cn(
            "flex min-h-11 shrink-0 items-center border-b-2 text-sm whitespace-nowrap",
            tab.current ? "border-fg-brand font-semibold text-fg-strong" : "border-transparent text-fg-subtle hover:text-fg-normal"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
