import { Badge } from "@sixthshift/design-system/badge";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronRight, CircleHelp, HeartPulse, type LucideIcon, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/** Where a live door goes: a place in the app, as a Link takes it. */
type Destination = Pick<LinkProps, "to" | "hash" | "search" | "params">;

/**
 * A way into the Library by the question you came with. Without `to` it is
 * still coming: drawn, marked "Coming", and not a link. Give it `to` (and
 * `meta`, such as a count) and it opens.
 */
function Door({ icon: Icon, title, examples, to, meta }: { icon: LucideIcon; title: string; examples: string; to?: Destination; meta?: ReactNode }) {
  const body = (
    <>
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full sm:size-11 bg-bg-brand-subtle text-fg-brand">
        <Icon className="size-5 sm:size-[22px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-none">
        <span className="text-base leading-snug font-display sm:text-lg font-semibold text-fg-strong">{title}</span>
        <span className="text-sm text-fg-subtle">{examples}</span>
      </span>
      <span className="shrink-0 sm:mt-auto">
        {to ? (
          <span className="flex items-center gap-1 text-sm font-medium text-fg-brand">
            {meta}
            <ChevronRight aria-hidden size={18} />
          </span>
        ) : (
          <Badge size="sm" variant="outline">
            Coming
          </Badge>
        )}
      </span>
    </>
  );
  const shape = "flex h-full items-center gap-3 rounded-xl border px-3 py-2.5 sm:flex-col sm:items-start sm:gap-3 sm:p-5";

  return to ? (
    <Link {...to} className={`${shape} border-border-subtle bg-bg-normal hover:border-border-brand`}>
      {body}
    </Link>
  ) : (
    <div className={`${shape} border-dashed border-border-subtle bg-bg-subtle`}>{body}</div>
  );
}

/** Can I…? A lookup: a verdict and why. Coming. */
export function CanIDoor() {
  return <Door icon={CircleHelp} title="Can I…?" examples="Brie, coffee, hair dye, flying" />;
}

/** Is this normal? Triage, from fine to call now. Coming. */
export function IsThisNormalDoor() {
  return <Door icon={HeartPulse} title="Is this normal?" examples="Cramps, spotting, itchy palms" />;
}

/** Nobody tells you: down to its shelf on this page. */
export function NobodyTellsYouDoor({ count, anchor }: { count: number; anchor: string }) {
  return (
    <Door
      icon={Sparkles}
      title="Nobody tells you"
      examples="What people wish they'd known"
      to={{ to: "/library", hash: anchor }}
      meta={count === 1 ? "1 to read" : `${count} to read`}
    />
  );
}
