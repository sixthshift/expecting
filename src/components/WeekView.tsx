import { Badge } from "@sixthshift/design-system/badge";
import { Button } from "@sixthshift/design-system/button";
import { Message } from "@sixthshift/design-system/message";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { builtInItems, builtInTasks, covers, startsAt } from "../content";
import { buildChecklist, overdue } from "../lib/checklist";
import { addDays, daysBetween, formatDate, type ISODate } from "../lib/dates";
import { gestationLabel, neighbour, type Position, pregnancyWeekStarts, type Slot, sameSlot, slotKey, slotLabel, slotShortLabel } from "../lib/timeline";
import { ItemCard } from "./ItemCard";
import { Columns, Page, Section } from "./Page";
import type { HouseholdState } from "./state";
import { TaskRow } from "./TaskRow";

type Props = { slot: Slot; position: Position | null; state: HouseholdState; today: ISODate };

/**
 * One week of the timeline: what starts now, what carries on, and the
 * standalone tasks due. On the current week it also shows what has slipped.
 */
export function WeekView({ slot, position, state, today }: Props) {
  const isNow = position !== null && sameSlot(position.slot, slot);
  const tasks = buildChecklist(builtInTasks, state.ownTasks);
  const starting = builtInItems.filter((item) => startsAt(item, slot));
  const continuing = builtInItems.filter((item) => covers(item, slot) && !startsAt(item, slot));
  const standalone = tasks.filter((t) => t.itemId === null && sameSlot(t.due, slot));
  const slipped = isNow && position ? overdue(tasks, state.ticks, position.slot) : [];

  return (
    <Page
      title={slotLabel(slot)}
      subtitle={<WeekSubtitle slot={slot} isNow={isNow} position={position} dueDate={state.household.dueDate} today={today} />}
      aside={isNow ? <Badge intent="brand">This week</Badge> : <ThisWeekLink position={position} />}
    >
      <WeekNav slot={slot} />
      <Columns
        sideLabel="Your tasks this week"
        side={
          <>
            {slipped.length > 0 ? (
              <Message
                intent="warning"
                title={slipped.length === 1 ? "One task has slipped past its week" : `${slipped.length} tasks have slipped past their week`}
              >
                <div className="mt-1 flex flex-col">
                  {slipped.map((task) => (
                    <TaskRow key={task.id} task={task} ticked={false} meta={slotShortLabel(task.due)} />
                  ))}
                </div>
              </Message>
            ) : null}
            {standalone.length > 0 ? (
              <Section title="Also on your list">
                <div className="flex flex-col">
                  {standalone.map((task) => (
                    <TaskRow key={task.id} task={task} ticked={Boolean(state.ticks[task.id])} />
                  ))}
                </div>
              </Section>
            ) : null}
          </>
        }
        main={
          <>
            {starting.length > 0 ? (
              <Section title="New this week">
                {starting.map((item) => (
                  <ItemCard key={item.id} item={item} ticks={state.ticks} />
                ))}
              </Section>
            ) : null}
            {continuing.length > 0 ? (
              <Section title="Still relevant">
                {continuing.map((item) => (
                  <ItemCard key={item.id} item={item} ticks={state.ticks} />
                ))}
              </Section>
            ) : null}
            {starting.length === 0 && continuing.length === 0 && standalone.length === 0 ? (
              <p className="text-fg-subtle">Nothing written for this week yet.</p>
            ) : null}
          </>
        }
      />
    </Page>
  );
}

function WeekSubtitle({
  slot,
  isNow,
  position,
  dueDate,
  today,
}: {
  slot: Slot;
  isNow: boolean;
  position: Position | null;
  dueDate: ISODate | null;
  today: ISODate;
}) {
  if (isNow && position?.gestationDays !== undefined && dueDate) {
    const toGo = daysBetween(today, dueDate);
    return (
      <>
        {gestationLabel(position.gestationDays)} · {toGo > 0 ? `${toGo} days to go` : toGo === 0 ? "due today" : `${-toGo} days past the due date`}
      </>
    );
  }
  if (isNow && position?.daysSinceBirth !== undefined) {
    const d = position.daysSinceBirth;
    return <>{d === 0 ? "Born today" : `${d} ${d === 1 ? "day" : "days"} old`}</>;
  }
  if (slot.phase === "pregnancy" && dueDate) {
    const start = pregnancyWeekStarts(slot.week, dueDate);
    const fmt = { day: "numeric", month: "short" } as const;
    return (
      <>
        {formatDate(start, fmt)} – {formatDate(addDays(start, 6), fmt)}
      </>
    );
  }
  if (slot.phase === "before") return <>Things best done before, or very early</>;
  return null;
}

function ThisWeekLink({ position }: { position: Position | null }) {
  if (!position) return null;
  return (
    <Button asChild size="sm" variant="outline">
      <Link to="/">This week</Link>
    </Button>
  );
}

function WeekNav({ slot }: { slot: Slot }) {
  const prev = neighbour(slot, -1);
  const next = neighbour(slot, 1);
  return (
    // From lg, as wide as the reading column under it (Columns: a 20rem side panel and a 2.5rem gap).
    <nav aria-label="Weeks" className="flex items-center justify-between gap-2 lg:mr-[22.5rem]">
      {prev ? (
        <Button asChild variant="ghost" size="sm">
          <Link to="/week/$slot" params={{ slot: slotKey(prev) }} aria-label={`Previous: ${slotLabel(prev)}`}>
            <ChevronLeft aria-hidden size={16} /> {slotShortLabel(prev)}
          </Link>
        </Button>
      ) : (
        <span />
      )}
      <Button asChild variant="ghost" size="sm">
        <Link to="/weeks">All weeks</Link>
      </Button>
      {next ? (
        <Button asChild variant="ghost" size="sm">
          <Link to="/week/$slot" params={{ slot: slotKey(next) }} aria-label={`Next: ${slotLabel(next)}`}>
            {slotShortLabel(next)} <ChevronRight aria-hidden size={16} />
          </Link>
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}
