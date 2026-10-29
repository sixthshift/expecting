import { cn } from "@sixthshift/design-system/utils";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * One setting as a line you can read at a glance (what it is, what it's set
 * to, who set it), opening in place to change it.
 */
export function SettingRow({
  id,
  label,
  value,
  meta,
  open,
  onToggle,
  children,
}: {
  /** Unique on the page: the row's anchor is `setting-<id>`. */
  id: string;
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panel = `setting-${id}-panel`;
  return (
    <div id={`setting-${id}`} className={cn("scroll-mt-24", open && "bg-bg-subtle")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={onToggle}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-normal-hovered focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring)"
      >
        <span className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-x-6">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium text-fg-strong">{label}</span>
            {meta ? <span className="text-xs text-fg-subtle">{meta}</span> : null}
          </span>
          <span className="text-sm text-fg-normal sm:max-w-64 sm:text-right">{value}</span>
        </span>
        <ChevronDown aria-hidden size={18} className={cn("shrink-0 text-fg-subtle motion-safe:transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <section id={panel} aria-label={label} className="px-4 pt-1 pb-5">
          {children}
        </section>
      ) : null}
    </div>
  );
}

/** Rows in one bordered list, divided. */
export function SettingList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal", className)}>{children}</div>;
}
