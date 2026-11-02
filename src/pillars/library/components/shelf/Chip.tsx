import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Narrowing } from "../../model/narrowing";

/** One way to narrow a shelf: a link to the shelf narrowed so, with how many it holds. */
export function Chip({ search, active, count, children }: { search: Narrowing; active: boolean; count?: number; children: ReactNode }) {
  return (
    <Link
      to="/library"
      search={search}
      replace
      resetScroll={false}
      // The router marks a link to exactly this page as current; "For the partner" links to turning itself off, so say it's on here.
      activeOptions={{ exact: true, includeSearch: true, explicitUndefined: true }}
      inactiveProps={{ "aria-current": active ? "page" : undefined }}
      className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap ${
        active
          ? "border-border-brand bg-bg-brand-subtle font-medium text-fg-brand"
          : "border-border-subtle bg-bg-normal text-fg-normal hover:border-border-normal"
      }`}
    >
      {children}
      {count !== undefined ? <span className={active ? "text-fg-brand" : "text-fg-subtle"}>{count}</span> : null}
    </Link>
  );
}
