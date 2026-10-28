import { Badge } from "@sixthshift/design-system/badge";
import { Card } from "@sixthshift/design-system/card";
import { ExternalLink } from "lucide-react";
import { CATEGORIES, type Item } from "../../content/schema";
import { formatDate, type ISODate } from "../../lib/dates";
import { weekLabel } from "../../lib/timeline";
import { TaskRow } from "../tasks/TaskRow";
import { ItemBody } from "./content/ItemBody";

/** "Week 28", "Weeks 28–36". */
export function rangeLabel(item: Item): string {
  return item.from === item.to ? weekLabel(item.from) : `Weeks ${item.from}–${item.to}`;
}

export function ItemCard({ item, ticks, onTick }: { item: Item; ticks: Record<string, string>; onTick?: (taskId: string, ticked: boolean) => void }) {
  return (
    <Card id={`item-${item.id}`} className="scroll-mt-4">
      <article className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge size="sm" variant="soft">
            {CATEGORIES[item.category]}
          </Badge>
          {item.surprise ? (
            <Badge size="sm" variant="soft" intent="brand">
              Nobody tells you
            </Badge>
          ) : null}
          {item.draft ? (
            <Badge size="sm" variant="outline" intent="warning" title="Drafted, not yet reviewed">
              Draft
            </Badge>
          ) : null}
          <span className="ml-auto text-xs text-fg-subtle">{rangeLabel(item)}</span>
        </div>
        <h3 className="text-lg leading-snug font-semibold text-fg-strong">{item.title}</h3>
        {/* A readable line length, however wide the column. */}
        <ItemBody doc={item.doc} className="max-w-prose" />
        {item.tasks.length > 0 ? (
          <div className="flex flex-col border-t border-border-subtle pt-2">
            {item.tasks.map((task) => (
              <TaskRow key={task.id} task={task} ticked={Boolean(ticks[task.id])} onTick={onTick && ((ticked) => onTick(task.id, ticked))} />
            ))}
          </div>
        ) : null}
        {item.source ? (
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
            <a href={item.source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
              {item.source.title}
              <ExternalLink aria-hidden size={12} />
            </a>
            {item.checked ? <span>checked {formatDate(item.checked as ISODate, { day: "numeric", month: "short", year: "numeric" })}</span> : null}
          </p>
        ) : null}
      </article>
    </Card>
  );
}
