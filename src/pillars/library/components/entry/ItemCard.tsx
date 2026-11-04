import { Badge } from "@sixthshift/design-system/badge";
import { Card } from "@sixthshift/design-system/card";
import { CalendarClock } from "lucide-react";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { TOPICS, TYPE_LABELS } from "../../../../content/schema";
import { TaskRow } from "../../../planner/features/tasks/components/TaskRow";
import { useEntry, useLibraryItemPage } from "../../contexts/LibraryItemPageContext";
import { rangeLabel } from "../../model/labels";
import { Verdict } from "../content/Verdict";
import { Body } from "./Body";
import { Sources } from "./Sources";

/**
 * An item in full, on its own page (its title the page's h1), drawn by its type: the question it answers and the answer
 * (a can-i's verdict), why it matters, what to do about it, then the detail —
 * a symptom's levels as triage, most urgent first — and its sources.
 */
export function ItemCard() {
  const { item } = useEntry();
  // Its page's heading on its own page; beside another page, in the side panel, under that page's.
  const Title = useLibraryItemPage().inPanel ? "h2" : "h1";
  const { data: ticks } = useChecklistQuery({ select: (c) => c.ticks });
  const short = item.type === "card" || item.type === "term";
  return (
    <Card id={`item-${item.id}`} className="relative scroll-mt-4 overflow-hidden">
      {/* A card, one of the things nobody tells you, wears the theme's colours along its top. */}
      {item.type === "card" ? (
        <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-(--expecting-accent-from) to-(--expecting-accent-to)" />
      ) : null}
      <article className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_LABELS[item.type] ? (
            <Badge size="sm" variant="soft" intent={item.type === "card" ? "brand" : "neutral"}>
              {TYPE_LABELS[item.type]}
            </Badge>
          ) : null}
          <Badge size="sm" variant="outline">
            {TOPICS[item.topic]}
          </Badge>
          {item.surprise && item.type !== "card" ? (
            <Badge size="sm" variant="soft" intent="brand">
              Nobody tells you
            </Badge>
          ) : null}
          <span className="ml-auto text-xs text-fg-subtle">{rangeLabel(item)}</span>
        </div>
        <div className="flex flex-col gap-1">
          {item.ask ? <p className="text-sm text-fg-subtle italic">“{item.ask}”</p> : null}
          <Title className={`leading-snug font-display font-semibold text-fg-strong ${short ? "text-2xl" : "text-xl"}`}>{item.title}</Title>
          {item.type === "term" && item.aliases.length > 0 ? <p className="text-sm text-fg-subtle">Also called {item.aliases.join(", ")}</p> : null}
        </div>
        {item.verdict ? <Verdict verdict={item.verdict} /> : null}
        {item.decideBy !== null ? (
          <p className="flex items-center gap-2 text-sm font-medium text-fg-strong">
            <CalendarClock aria-hidden size={16} className="text-fg-brand" /> Decide by week {item.decideBy}
          </p>
        ) : null}
        {/* A card or a term is its body; anything longer leads with why it matters. */}
        {item.summary && !short ? <p className="max-w-prose text-fg-normal">{item.summary}</p> : null}
        {/* What to do first, then why. */}
        {item.tasks.length > 0 ? (
          <div className="flex flex-col border-y border-border-subtle py-2">
            <h2 className="text-xs font-semibold tracking-wide text-fg-subtle uppercase">To do</h2>
            {item.tasks.map((task) => (
              <TaskRow key={task.id} task={task} ticked={Boolean(ticks[task.id])} />
            ))}
          </div>
        ) : null}
        <Body />
        <Sources />
      </article>
    </Card>
  );
}
