import { Message } from "@sixthshift/design-system/message";
import { cn } from "@sixthshift/design-system/utils";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { formatDate, type ISODate } from "../../lib/dates";
import { type Slot, slotDates, slotShortLabel } from "../../lib/timeline";
import type { Band as BandData } from "../../lib/timelineView";
import { AddTask, DeleteOwnTask } from "../AddTask";
import { ItemCard, rangeLabel } from "../ItemCard";
import { AskedQuestion } from "../questions";
import { TaskRow } from "../TaskRow";

type Props = {
  band: BandData;
  expanded: boolean;
  onToggle: () => void;
  ticks: Record<string, string>;
  /** Jump to an item, in whatever week it starts. */
  onOpenItem: (itemId: string) => void;
  dueDate: ISODate | null;
  birthDate: ISODate | null;
  /** What sits at the top of the current week: the hero line, open questions. */
  nowContent?: ReactNode;
  register: (key: string, el: HTMLElement | null) => void;
};

/** The big label in the week's gutter: "28", "Before", "+3". */
function Numeral({ slot }: { slot: Slot }) {
  if (slot.phase === "before") return <span className="text-2xl font-semibold lg:text-3xl">Before</span>;
  return <span className="text-3xl font-semibold tabular-nums lg:text-5xl">{slotShortLabel(slot)}</span>;
}

/** The words after the numeral: "28 weeks", "1 week", "+3 after birth". */
function caption(slot: Slot): string {
  switch (slot.phase) {
    case "before":
      return "";
    case "pregnancy":
      return slot.week === 1 ? "week" : "weeks";
    case "postpartum":
      return "after birth";
  }
}

/**
 * One week on the timeline. A gutter holds its number and dates (sticky on a
 * desktop, so the number stays with you down a long week); beside it, the
 * week's content. A week other than the current one is folded to one line of
 * what's in it until it is opened.
 */
export function Band({ band, expanded, onToggle, ticks, onOpenItem, dueDate, birthDate, nowContent, register }: Props) {
  const { slot, key, isNow, isPast } = band;
  const dates = slotDates(slot, dueDate, birthDate);
  const foldable = !isNow;
  const open = !foldable || expanded;
  const dateLine = dates
    ? `${formatDate(dates.start, { day: "numeric", month: "short" })} – ${formatDate(dates.end, { day: "numeric", month: "short" })}`
    : null;

  const summary = [
    band.starting.length > 0 ? `${band.starting.length} new` : null,
    band.openTasks > 0 ? `${band.openTasks} to do` : null,
    band.starting.some((i) => i.surprise) ? "nobody tells you" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      ref={(el) => register(key, el)}
      id={`week-${key}`}
      data-week={key}
      aria-labelledby={`week-${key}-label`}
      className={cn(
        "scroll-mt-32 lg:grid lg:scroll-mt-24 lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-x-8",
        isNow ? "relative my-4 rounded-xl border border-border-subtle bg-bg-normal p-4 shadow-sm lg:my-8 lg:p-6" : "border-t border-border-subtle py-2",
        isPast && !isNow && "opacity-80"
      )}
    >
      {/* This week is a white card; the theme's colour is a stripe along its top, not a fill.
          Rounded itself rather than clipped by the card: overflow-hidden there would break the sticky week number. */}
      {isNow ? (
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-linear-to-r from-(--expecting-accent-from) to-(--expecting-accent-to)" />
      ) : null}
      <header className={cn("lg:sticky lg:top-24 lg:self-start", foldable && "contents lg:block")}>
        <button
          type="button"
          disabled={!foldable}
          onClick={onToggle}
          aria-expanded={foldable ? open : undefined}
          className={cn(
            "flex w-full items-baseline gap-3 text-left lg:flex-col lg:items-start lg:gap-0.5",
            foldable ? "min-h-11 cursor-pointer" : "cursor-default"
          )}
        >
          <h2 id={`week-${key}-label`} className={cn("flex items-baseline gap-2", isNow ? "text-fg-brand" : "text-fg-strong")}>
            <Numeral slot={slot} />
            <span className="text-sm font-normal text-fg-subtle">{caption(slot)}</span>
          </h2>
          <span className="text-sm text-fg-subtle">{dateLine ?? (slot.phase === "before" ? "Best done before, or very early" : null)}</span>
          {foldable ? (
            <span className="ml-auto flex items-center gap-2 text-sm text-fg-subtle lg:hidden">
              {summary}
              <ChevronDown aria-hidden size={16} className={cn("transition-transform", open && "rotate-180")} />
            </span>
          ) : null}
        </button>
      </header>

      <div className="flex min-w-0 flex-col gap-4">
        {foldable ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={`${open ? "Fold" : "Open"} ${key === "before" ? "before you start" : `week ${key}`}`}
            className="hidden min-h-11 items-center gap-2 self-start text-sm text-fg-subtle hover:text-fg-normal lg:flex"
          >
            {summary}
            <ChevronDown aria-hidden size={16} className={cn("transition-transform", open && "rotate-180")} />
          </button>
        ) : null}

        {open ? (
          <>
            {isNow ? nowContent : null}

            {band.slipped.length > 0 ? (
              <Message
                intent="warning"
                title={band.slipped.length === 1 ? "One task has slipped past its week" : `${band.slipped.length} tasks have slipped past their week`}
              >
                <div className="mt-1 flex flex-col">
                  {band.slipped.map((task) => (
                    <TaskRow key={task.id} task={task} ticked={false} meta={slotShortLabel(task.due)} />
                  ))}
                </div>
              </Message>
            ) : null}

            {band.starting.map((item) => (
              <ItemCard key={item.id} item={item} ticks={ticks} />
            ))}

            {band.tasks.length > 0 ? (
              <div className="flex flex-col">
                {band.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    ticked={Boolean(ticks[task.id])}
                    action={task.origin === "own" ? <DeleteOwnTask task={task} /> : <WhyLink task={task} onOpenItem={onOpenItem} />}
                  />
                ))}
              </div>
            ) : null}

            {band.continuing.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-fg-subtle">Still running from earlier weeks</p>
                <ul className="flex flex-wrap gap-2">
                  {band.continuing.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onOpenItem(item.id)}
                        className="min-h-9 rounded-full border border-border-normal bg-bg-normal px-3 text-sm hover:bg-bg-normal-hovered"
                      >
                        {item.title} <span className="text-fg-subtle">· {rangeLabel(item)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {band.asked.map((q) => (
              <AskedQuestion key={q.id} question={q} />
            ))}

            <AddTask slot={slot} />
          </>
        ) : null}
      </div>
    </section>
  );
}

function WhyLink({ task, onOpenItem }: { task: BandData["tasks"][number]; onOpenItem: Props["onOpenItem"] }) {
  if (!task.itemId) return null;
  const itemId = task.itemId;
  return (
    <button type="button" onClick={() => onOpenItem(itemId)} aria-label={`Why: ${task.title}`} className="shrink-0 px-1 text-xs text-fg-subtle underline">
      Why
    </button>
  );
}
