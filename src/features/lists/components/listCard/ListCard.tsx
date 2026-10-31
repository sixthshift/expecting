import { Card } from "@sixthshift/design-system/card";
import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { type ListSummary, upToSaying } from "../../../../lib/lists";
import { listIcon } from "../icons";

/** A list at a glance: its icon, what it's for, where it's up to, and the first few still to get. The whole card opens it. */
export function ListCard({ list }: { list: ListSummary }) {
  const Icon = listIcon(list.id);
  const more = list.left - list.next.length;
  return (
    <Link
      to="/planner/lists/$listId"
      params={{ listId: list.id }}
      aria-label={list.title}
      className="block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      <Card size="md" className="flex h-full flex-col gap-3 hover:bg-bg-normal-hovered">
        <span className="flex items-start gap-3">
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-brand-subtle text-fg-brand">
            <Icon size={20} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-display text-lg font-semibold text-fg-strong">{list.title}</span>
            {list.about ? <span className="text-sm text-fg-subtle">{list.about}</span> : null}
          </span>
          <ChevronRight aria-hidden size={18} className="mt-1 shrink-0 text-fg-subtle" />
        </span>
        {list.total > 0 ? <ProgressBar completed={list.got} total={list.total} showFraction={false} label={`${list.title}: got so far`} /> : null}
        <span className="flex flex-col gap-0.5 text-sm">
          <span className="text-fg-normal">{upToSaying(list.id, list)}</span>
          {list.next.length > 0 ? (
            <span className="text-fg-subtle">
              Next: {list.next.join(", ")}
              {more > 0 ? ` and ${more} more` : null}
            </span>
          ) : null}
        </span>
      </Card>
    </Link>
  );
}
