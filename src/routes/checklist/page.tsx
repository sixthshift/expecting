import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Input } from "@sixthshift/design-system/input";
import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import { Select } from "@sixthshift/design-system/select";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Link, useRouter } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Columns, Page, Section } from "../../components/Page";
import { TaskRow } from "../../components/TaskRow";
import { builtInTasks } from "../../content";
import type { Task } from "../../content/schema";
import { buildChecklist } from "../../lib/checklist";
import { todayISO } from "../../lib/dates";
import { allSlots, compareSlots, parseSlotKey, positionOn, type Slot, sameSlot, slotKey, slotLabel } from "../../lib/timeline";
import { addOwnTask, deleteOwnTask } from "../../server/functions/checklist";
import { Route } from "./route";

type Show = "todo" | "all";

/** Every task, in the order they fall due. Ticking here ticks it on its week too. */
export function ChecklistPage() {
  const state = Route.useLoaderData();
  const [show, setShow] = useState<Show>("todo");
  // Ticked during this visit: they stay on screen under "To do" until you leave,
  // so a tick can be seen to land and a mis-tap undone.
  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const { dueDate, birthDate } = state.household;
  const current = dueDate ? positionOn(todayISO(), dueDate, birthDate).slot : null;

  const tasks = buildChecklist(builtInTasks, state.ownTasks);
  const done = tasks.filter((t) => state.ticks[t.id]).length;
  const visible = show === "all" ? tasks : tasks.filter((t) => !state.ticks[t.id] || tickedHere.has(t.id));
  const groups = groupByDue(visible);

  return (
    <Page title="Checklist" subtitle={`${done} of ${tasks.length} done`}>
      <Columns
        sideLabel="Progress and adding a task"
        side={
          <>
            <ProgressBar completed={done} total={tasks.length} showFraction={false} label="Checklist progress" />
            <AddTask defaultSlot={current ?? { phase: "before" }} />
            <ToggleGroup
              type="single"
              appearance="segmented"
              size="sm"
              value={show}
              onValueChange={(v) => v && setShow(v as Show)}
              options={[
                { value: "todo", label: "To do" },
                { value: "all", label: "Everything" },
              ]}
              aria-label="Show"
            />
          </>
        }
        main={
          <>
            {groups.length === 0 ? <p className="text-fg-subtle">{show === "todo" ? "All done. Nicely handled." : "No tasks yet."}</p> : null}
            {groups.map(({ slot, tasks }) => {
              const late = current !== null && compareSlots(slot, current) < 0;
              const isNow = current !== null && sameSlot(slot, current);
              return (
                <Section key={slotKey(slot)} title={`${slotLabel(slot)}${isNow ? " · this week" : ""}`}>
                  <div className="flex flex-col">
                    {tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        ticked={Boolean(state.ticks[task.id])}
                        onTick={(ticked) => ticked && setTickedHere((ids) => new Set(ids).add(task.id))}
                        meta={late && !state.ticks[task.id] ? <span className="text-fg-warning">overdue</span> : null}
                        action={task.origin === "own" ? <DeleteOwnTask task={task} /> : <ReadMore task={task} />}
                      />
                    ))}
                  </div>
                </Section>
              );
            })}
          </>
        }
      />
    </Page>
  );
}

function groupByDue(tasks: Task[]): { slot: Slot; tasks: Task[] }[] {
  const groups: { slot: Slot; tasks: Task[] }[] = [];
  for (const task of tasks) {
    const last = groups.at(-1);
    if (last && sameSlot(last.slot, task.due)) last.tasks.push(task);
    else groups.push({ slot: task.due, tasks: [task] });
  }
  return groups;
}

function ReadMore({ task }: { task: Task }) {
  if (!task.itemId) return null;
  return (
    <Link to="/week/$slot" params={{ slot: slotKey(task.due) }} hash={`item-${task.itemId}`} className="shrink-0 px-1 text-xs text-fg-subtle underline">
      Why
    </Link>
  );
}

function DeleteOwnTask({ task }: { task: Task }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={`Delete "${task.title}"`}
      onClick={async () => {
        await deleteOwnTask({ data: { id: task.id } });
        await router.invalidate();
      }}
    >
      <Trash2 aria-hidden size={16} />
    </Button>
  );
}

const slotOptions = allSlots().map((slot) => ({ value: slotKey(slot), label: slotLabel(slot) }));

function AddTask({ defaultSlot }: { defaultSlot: Slot }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState(slotKey(defaultSlot));
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const slot = parseSlotKey(when);
    if (!slot || title.trim().length === 0) return;
    setSaving(true);
    try {
      const data = slot.phase === "before" ? { title, phase: slot.phase, week: null } : { title, phase: slot.phase, week: slot.week };
      await addOwnTask({ data });
      setTitle("");
      await router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card size="sm">
      <form onSubmit={submit} className="flex flex-col gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a task of your own" aria-label="New task" maxLength={200} />
        <div className="flex gap-2">
          <Select options={slotOptions} value={when} onValueChange={setWhen} searchable aria-label="Due" className="flex-1" />
          <Button type="submit" intent="brand" loading={saving} disabled={title.trim().length === 0}>
            Add
          </Button>
        </div>
      </form>
    </Card>
  );
}
