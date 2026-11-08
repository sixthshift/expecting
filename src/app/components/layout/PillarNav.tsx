import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { PILLARS } from "./pillars";

const TAB_COLUMNS: Record<number, string> = { 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" };

/**
 * The pillars (`PILLARS`) as a row: the phone's tab bar (`tabs`, icons over their names,
 * under the thumb) or the desktop's top bar (`bar`, names beside their icons,
 * in the middle of it). The pillar is current on its own page and on every
 * page under it.
 */
export function PillarNav({ layout }: { layout: "tabs" | "bar" }) {
  const tabs = layout === "tabs";
  return (
    <nav aria-label="Expecting">
      <ul className={tabs ? cn("grid h-15", TAB_COLUMNS[PILLARS.length]) : "flex items-center gap-1"}>
        {PILLARS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              // Home is `/`, which every other page is under.
              activeOptions={{ exact: to === "/", includeSearch: false }}
              activeProps={{
                "aria-current": "page",
                className: tabs ? "text-fg-brand" : "bg-bg-brand-subtle font-semibold text-fg-on-brand-subtle",
              }}
              inactiveProps={{ className: tabs ? "text-fg-subtle" : "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal" }}
              className={cn(
                tabs
                  ? "flex h-full flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-medium"
                  : "flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium whitespace-nowrap"
              )}
            >
              <Icon aria-hidden size={tabs ? 22 : 17} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
