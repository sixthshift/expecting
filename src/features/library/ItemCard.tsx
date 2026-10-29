import { Badge } from "@sixthshift/design-system/badge";
import { Card } from "@sixthshift/design-system/card";
import { ExternalLink } from "lucide-react";
import { type Item, type ItemPage, TOPICS } from "../../content/schema";
import { formatDate, type ISODate } from "../../lib/dates";
import { weekLabel } from "../../lib/timeline";
import { TaskRow } from "../tasks/TaskRow";
import { ItemBody } from "./content/ItemBody";

/** "Week 28", "Weeks 28–36"; null for one without weeks. */
export function rangeLabel(item: Item): string | null {
  if (item.from === null) return null;
  return item.from === item.to ? weekLabel(item.from) : `Weeks ${item.from}–${item.to}`;
}

/** An item in full: what it is, why it matters, what to do about it, then the detail and its sources. */
export function ItemCard({
  item,
  page,
  ticks,
  onTick,
}: {
  item: Item;
  page: ItemPage;
  ticks: Record<string, string>;
  onTick?: (taskId: string, ticked: boolean) => void;
}) {
  return (
    <Card id={`item-${item.id}`} className="scroll-mt-4">
      <article className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge size="sm" variant="soft">
            {TOPICS[item.topic]}
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
        <h3 className="text-lg leading-snug font-display font-semibold text-fg-strong">{item.title}</h3>
        {item.summary ? <p className="max-w-prose text-fg-normal">{item.summary}</p> : null}
        {/* What to do first, then why. */}
        {item.tasks.length > 0 ? (
          <div className="flex flex-col border-y border-border-subtle py-2">
            <h4 className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">To do</h4>
            {item.tasks.map((task) => (
              <TaskRow key={task.id} task={task} ticked={Boolean(ticks[task.id])} onTick={onTick && ((ticked) => onTick(task.id, ticked))} />
            ))}
          </div>
        ) : null}
        {/* A readable line length, however wide the column. */}
        <ItemBody doc={page.doc} className="max-w-prose" />
        {page.sources.length > 0 ? (
          <div className="flex flex-col gap-1 text-xs text-fg-subtle">
            <ul className="flex flex-col gap-1">
              {page.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                    {source.title}
                    <ExternalLink aria-hidden size={12} />
                  </a>
                </li>
              ))}
            </ul>
            {page.checked ? <p>checked {formatDate(page.checked as ISODate, { day: "numeric", month: "short", year: "numeric" })}</p> : null}
          </div>
        ) : null}
      </article>
    </Card>
  );
}
