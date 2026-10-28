import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { Task } from "../../content/schema";
import { GROUP_TITLES, groupTasks } from "../../lib/planner";
import { WEEKS, weekLabel } from "../../lib/timeline";
import { PillarHeader } from "../app/PillarLayout";
import { useApp } from "../household/useApp";
import { AddQuestion, AskedQuestion, OpenQuestion } from "../questions/questions";
import { AddTask, DeleteOwnTask } from "../tasks/AddTask";
import { TaskRow } from "../tasks/TaskRow";

/**
 * What to do and what to ask: the to-do list grouped by when it matters
 * (src/lib/planner.ts), and the questions for the next appointment.
 */
export function PlannerPage() {
  const { state, questions, now, tasks } = useApp();
  // Ticked during this visit: they stay in their group until the next one.
  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const groups = groupTasks(tasks, state.ticks, tickedHere, now);
  const open = questions.filter((q) => !q.askedAt);
  const asked = questions.filter((q) => q.askedAt);

  function row(task: Task) {
    return (
      <TaskRow
        key={task.id}
        task={task}
        ticked={Boolean(state.ticks[task.id])}
        meta={weekLabel(task.due)}
        onTick={(ticked) => ticked && setTickedHere((ids) => new Set(ids).add(task.id))}
        action={
          task.origin === "own" ? (
            <DeleteOwnTask task={task} />
          ) : task.itemId ? (
            <Link
              to="/library/$itemId"
              params={{ itemId: task.itemId }}
              aria-label={`Why: ${task.title}`}
              className="shrink-0 px-1 text-xs text-fg-subtle underline hover:text-fg-normal"
            >
              Why
            </Link>
          ) : null
        }
      />
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Planner" lead="What to do and what to ask, so nothing sneaks up on you." />
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-10">
        <section aria-labelledby="todo" className="flex flex-col gap-6">
          <h2 id="todo" className="text-lg font-semibold text-fg-strong">
            To do
          </h2>
          {(["slipped", "now", "soon", "later"] as const).map((g) =>
            groups[g].length > 0 ? (
              <Group key={g} title={now !== null ? GROUP_TITLES[g] : "To do"} count={groups[g].length} tone={g === "slipped" ? "warning" : undefined}>
                {groups[g].map(row)}
              </Group>
            ) : null
          )}
          {groups.done.length > 0 ? (
            <Group title={GROUP_TITLES.done} count={groups.done.length} folded>
              {groups.done.map(row)}
            </Group>
          ) : null}
          {/* Expecting knows what needs doing; this is for the odd thing it couldn't. */}
          <AddTask week={now ?? WEEKS.first} />
        </section>

        <section id="questions" aria-labelledby="questions-heading" className="flex scroll-mt-6 flex-col gap-4 lg:sticky lg:top-6">
          <h2 id="questions-heading" className="text-lg font-semibold text-fg-strong">
            For the next appointment
          </h2>
          <AddQuestion />
          {open.length === 0 ? <p className="text-sm text-fg-subtle">Nothing to ask yet. Add a question as it comes to you.</p> : null}
          {open.map((q) => (
            <OpenQuestion key={q.id} question={q} />
          ))}
          {asked.length > 0 ? (
            <Group title="Asked" count={asked.length} folded>
              <div className="flex flex-col gap-3">
                {asked.map((q) => (
                  <AskedQuestion key={q.id} question={q} />
                ))}
              </div>
            </Group>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Group({ title, count, tone, folded = false, children }: { title: string; count: number; tone?: "warning"; folded?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!folded);
  const heading = (
    <>
      <span className={tone === "warning" ? "text-fg-warning" : undefined}>{title}</span>
      <span className="font-normal text-fg-subtle">{count}</span>
    </>
  );
  return (
    <div className="flex flex-col gap-1">
      {folded ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-fg-normal"
        >
          {heading}
          <ChevronDown aria-hidden size={16} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      ) : (
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg-normal">{heading}</h3>
      )}
      {open ? <div className="flex flex-col">{children}</div> : null}
    </div>
  );
}
