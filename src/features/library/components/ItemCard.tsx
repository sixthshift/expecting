import { Badge } from "@sixthshift/design-system/badge";
import { Card } from "@sixthshift/design-system/card";
import { CalendarClock, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { type Item, type ItemPage, SYMPTOM_LEVELS, TOPICS, TYPE_LABELS } from "../../../content/schema";
import { type Section, sectionsOf } from "../../../content/sections";
import { formatDate, type ISODate } from "../../../lib/dates";
import { weekLabel } from "../../../lib/timeline";
import { TaskRow } from "../../tasks/components/TaskRow";
import { ItemBody } from "./content/ItemBody";
import { Triage } from "./content/Triage";
import { Verdict } from "./content/Verdict";

/** "Week 28", "Weeks 28–36"; null for one without weeks. */
export function rangeLabel(item: Item): string | null {
  if (item.from === null) return null;
  return item.from === item.to ? weekLabel(item.from) : `Weeks ${item.from}–${item.to}`;
}

/**
 * An item in full, on its own page (its title the page's h1), drawn by its type: the question it answers and the answer
 * (a can-i's verdict), why it matters, what to do about it, then the detail —
 * a symptom's levels as triage, most urgent first — and its sources.
 */
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
          {item.draft ? (
            <Badge size="sm" variant="outline" intent="warning" title="Drafted, not yet reviewed">
              Draft
            </Badge>
          ) : null}
          <span className="ml-auto text-xs text-fg-subtle">{rangeLabel(item)}</span>
        </div>
        <div className="flex flex-col gap-1">
          {item.ask ? <p className="text-sm text-fg-subtle italic">“{item.ask}”</p> : null}
          <h1 className={`leading-snug font-display font-semibold text-fg-strong ${short ? "text-2xl" : "text-xl"}`}>{item.title}</h1>
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
              <TaskRow key={task.id} task={task} ticked={Boolean(ticks[task.id])} onTick={onTick && ((ticked) => onTick(task.id, ticked))} />
            ))}
          </div>
        ) : null}
        <Body item={item} page={page} />
        <Sources page={page} />
      </article>
    </Card>
  );
}

/** The body, by type: a symptom's levels lifted out as triage, everything else as written. */
function Body({ item, page }: { item: Item; page: ItemPage }) {
  if (item.type !== "symptom") return <ItemBody doc={page.doc} className="max-w-prose" />;
  const sections = sectionsOf(page.doc);
  const levels = sections.filter((s) => (SYMPTOM_LEVELS as readonly (string | null)[]).includes(s.title));
  const usual = sections.filter((s) => !levels.includes(s));
  return (
    <div className="flex flex-col gap-6">
      {/* Someone wondering whether to worry sees when to first. */}
      {levels.length > 0 ? <Triage levels={levels} question={item.ask ?? `About ${item.title.toLowerCase()}`} /> : null}
      {usual.map((s) => (
        <Part key={s.title ?? ""} section={s} />
      ))}
    </div>
  );
}

function Part({ section }: { section: Section }): ReactNode {
  return (
    <section className="flex flex-col">
      {section.title ? <h2 className="text-lg font-display font-semibold text-fg-strong">{section.title}</h2> : null}
      <ItemBody doc={section.doc} className="max-w-prose" />
    </section>
  );
}

/** Where every claim comes from, and when a second reader last checked them. */
function Sources({ page }: { page: ItemPage }) {
  if (page.sources.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 border-t border-border-subtle pt-3 text-xs text-fg-subtle">
      <h2 className="font-semibold tracking-wide uppercase">{page.sources.length === 1 ? "Source" : "Sources"}</h2>
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
      {page.checked ? <p>Checked against them {formatDate(page.checked as ISODate, { day: "numeric", month: "short", year: "numeric" })}</p> : null}
    </div>
  );
}
