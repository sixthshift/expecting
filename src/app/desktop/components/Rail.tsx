import { cn } from "@sixthshift/design-system/utils";
import { Link, type LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * A pillar's rail on a desktop: its own places, down the left of every page
 * of it (`PillarLayout`'s `rail`), under the top bar's pillars. Each place is
 * an address (`RailLink`), so back, links and the phone all agree.
 */
export function Rail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </nav>
  );
}

/**
 * One place on a rail: where it goes (`to`, and `search` where a place is a
 * filter, the Library's doors), whether it's where you are (`current`, worked
 * out by the rail, which knows what counts), and, under another, `nested`
 * (a list under Lists). `count` is a quiet number at its end.
 */
export function RailLink({
  to,
  params,
  search,
  current,
  icon: Icon,
  nested,
  count,
  children,
}: {
  to: LinkProps["to"];
  params?: LinkProps["params"];
  search?: LinkProps["search"];
  current: boolean;
  icon?: LucideIcon;
  nested?: boolean;
  count?: number;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        to={to}
        params={params}
        search={search}
        aria-current={current ? "page" : undefined}
        className={cn(
          "flex min-h-10 items-center gap-2.5 rounded-md px-3 text-sm",
          nested && "min-h-9 pl-9",
          current ? "bg-bg-brand-subtle font-medium text-fg-on-brand-subtle" : "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
        )}
      >
        {Icon ? <Icon aria-hidden size={17} className="shrink-0" /> : null}
        <span className="min-w-0 flex-1 truncate">{children}</span>
        {count !== undefined ? <span className="text-xs text-fg-subtle tabular-nums">{count}</span> : null}
      </Link>
    </li>
  );
}

/** A quiet line between a rail's groups of places. */
export function RailBreak() {
  return <li aria-hidden className="mx-3 my-2 border-t border-border-subtle" />;
}
