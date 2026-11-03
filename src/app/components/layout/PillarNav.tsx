import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import type { Pillar } from "./AppLayout";

const TAB_COLUMNS: Record<number, string> = { 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" };

/** The pillars as the desktop's sidebar lists them (`list`), or the phone's tab bar (`tabs`). */
export function PillarNav({ pillars, layout }: { pillars: readonly Pillar[]; layout: "list" | "tabs" }) {
  const tabs = layout === "tabs";
  return (
    <nav aria-label="Expecting">
      <ul className={tabs ? cn("grid h-15", TAB_COLUMNS[pillars.length]) : "flex flex-col gap-1"}>
        {pillars.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              // Home is `/`, which every other page is under.
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
