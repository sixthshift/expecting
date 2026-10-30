import { Badge } from "@sixthshift/design-system/badge";
import { Card } from "@sixthshift/design-system/card";
import { ProgressBar } from "@sixthshift/design-system/progress-bar";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { usePeople } from "../../../api/rpc/people";
import { useQuestions } from "../../../api/rpc/questions";
import { useNow } from "../../../api/rpc/settings";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import type { Item, Task } from "../../../content/schema";
import { whose } from "../../../lib/people";
import { type Ahead, planTasks, type Stage, stagesAhead } from "../../../lib/planner";
import { WEEKS, type Week, weekLabel } from "../../../lib/timeline";
import { type ToDo, whenToDo } from "../../../lib/todo";
import { useItems } from "../../library/hooks/useItems";
import { AddQuestion, AskedQuestion, OpenQuestion } from "../../questions/components/questions/questions";
import { AddTask, DeleteOwnTask } from "../../tasks/components/addTask/AddTask";
import { TaskRow } from "../../tasks/components/TaskRow";
import { useTasks } from "../../tasks/hooks/useTasks";

const week = (w: Week) => weekLabel(w).toLowerCase();

/** How many of a stage's tasks it names while folded, before "and N more". */
const PREVIEW = 2;

const AHEAD_AT: Record<Ahead["at"], (w: Week) => string> = {
  opens: (w) => `opens ${week(w)}`,
  due: (w) => `by ${week(w)}`,
  deadline: (w) => `deadline ${week(w)}`,
};

/**
 * What to do and what to ask. To do starts somewhere: the one thing to do
 * next, then the rest of what to do now, with what's ahead, missed and done
 * folded away (src/lib/planner.ts). Beside it, the questions for the next
 * appointment.
 */
export function PlannerPage() {
  const { me, people } = usePeople().data;
  const { data: checklist } = useChecklist();
  const now = useNow();
  const tasks = useTasks();
  const items = useItems();
  const { data: questions } = useQuestions();
  // Ticked during this visit: they stay where they were until the next one.
  const [tickedHere, setTickedHere] = useState<ReadonlySet<string>>(new Set());
  const plan = planTasks(tasks, checklist.ticks, tickedHere, now);
  const stages = stagesAhead(plan);
  const open = questions.filter((q) => !q.askedAt);
  const asked = questions.filter((q) => q.askedAt);
  const deadlines = [plan.next, ...plan.now].filter((t) => t?.why === "deadline" && !checklist.ticks[t.task.id]).length;

  const stay = (task: Task) => (ticked: boolean) => ticked && setTickedHere((ids) => new Set(ids).add(task.id));
  const whoseIs = (task: Task) => (task.who === "together" ? null : <span>{whose(task.who, me, people)}</span>);
  const why = (task: Task) =>
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
    ) : null;

  function row(task: Task, when: ReactNode) {
    return (
      <TaskRow
        key={task.id}
        task={task}
        ticked={Boolean(checklist.ticks[task.id])}
        stack
        meta={
          <span className="flex flex-wrap items-center gap-x-2">
            {when}
            {whoseIs(task)}
          </span>
        }
        onTick={stay(task)}
        action={why(task)}
      />
    );
  }

  const whenNow = (entry: ToDo, current: Week) =>
    entry.why === "deadline" ? (
      <Badge size="sm" variant="soft" intent="warning">
        {whenToDo(entry, current)}
      </Badge>
    ) : (
      <span>{whenToDo(entry, current)}</span>
    );

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
      <PillarHeader title="Planner" lead="What to do and what to ask, so nothing sneaks up on you." />
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-10">
        <section aria-labelledby="todo" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 id="todo" className="text-lg font-display font-semibold text-fg-strong">
              To do
            </h2>
            {plan.progress.total > 0 ? (
              <div className="flex max-w-md flex-col gap-1">
                <ProgressBar completed={plan.progress.done} total={plan.progress.total} showFraction={false} label="Done so far" />
                <p className="text-sm text-fg-subtle">
                  {plan.progress.done} of {plan.progress.total} done
                  {now === null
                    ? null
                    : deadlines > 0
                      ? ` · ${deadlines === 1 ? "a deadline" : `${deadlines} deadlines`} close`
                      : plan.next
                        ? " · nothing urgent"
                        : " · nothing to do right now"}
                </p>
              </div>
            ) : null}
          </div>

          {now !== null && plan.next ? (
            <NextUp
              task={plan.next.task}
              ticked={Boolean(checklist.ticks[plan.next.task.id])}
              item={items.find((i) => i.id === plan.next?.task.itemId)}
              meta={
                <>
                  {whenNow(plan.next, now)}
                  {whoseIs(plan.next.task)}
                </>
              }
            />
          ) : null}
          {now !== null && !plan.next ? <p className="text-fg-normal">Nothing needs doing right now. What's ahead is below, when you want a look.</p> : null}

          {now !== null && plan.now.length > 0 ? (
            <Group title="Also now" count={plan.now.length}>
              {plan.now.map((entry) => row(entry.task, whenNow(entry, now)))}
            </Group>
          ) : null}

          {stages.length > 0 ? (
            <section aria-labelledby="horizon" className="flex flex-col gap-3">
              <h3 id="horizon" className="text-sm font-semibold text-fg-normal">
                {now === null ? "To do" : "On the horizon"}
              </h3>
              {stages.map((stage) => (
                <StageCard key={stage.end} stage={stage} now={now}>
                  {stage.ahead.map(({ task, week: w, at }) => row(task, <span>{AHEAD_AT[at](w)}</span>))}
                  {stage.done.map((task) => row(task, null))}
                </StageCard>
              ))}
            </section>
          ) : null}

          {plan.earlier.length > 0 ? (
            <Group title="Missed earlier" count={plan.earlier.length} folded>
              {plan.earlier.map((task) => row(task, <span>was due {week(task.due)}</span>))}
            </Group>
          ) : null}

          {plan.done.length > 0 ? (
            <Group title="Done" count={plan.done.length} folded>
              {plan.done.map((task) => row(task, null))}
            </Group>
          ) : null}

          {/* Expecting knows what needs doing; this is for the odd thing it couldn't. */}
          <AddTask week={now ?? WEEKS.first} />
        </section>

        <section id="questions" aria-labelledby="questions-heading" className="flex scroll-mt-6 flex-col gap-4 lg:sticky lg:top-6">
          <h2 id="questions-heading" className="text-lg font-display font-semibold text-fg-strong">
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

/** The one thing to do first, given room: when, whose, and why it matters. Ticking it brings up the next. */
function NextUp({ task, ticked, item, meta }: { task: Task; ticked: boolean; item: Item | undefined; meta: ReactNode }) {
  return (
    <section aria-labelledby="next-up" className="flex flex-col gap-2">
      <h3 id="next-up" className="text-sm font-semibold text-fg-normal">
        Next up
      </h3>
      <Card size="lg" className="flex flex-col gap-2">
        <TaskRow task={task} ticked={ticked} action={task.origin === "own" ? <DeleteOwnTask task={task} /> : null} />
        <div className="flex flex-col gap-2 pl-9">
          <span className="flex flex-wrap items-center gap-x-2 text-sm text-fg-subtle">{meta}</span>
          {item?.summary ? <p className="max-w-prose text-fg-normal">{item.summary}</p> : null}
          {item ? (
            <Link
              to="/library/$itemId"
              params={{ itemId: item.id }}
              aria-label={`Why: ${task.title}`}
              className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal"
            >
              Why it matters, and how
              <ChevronRight aria-hidden size={16} />
            </Link>
          ) : null}
        </div>
      </Card>
    </section>
  );
}

/**
 * One stage ahead, folded: what it's working towards and how far off, its
 * first few tasks, and how much of it is done. Opened, all its tasks.
 */
function StageCard({ stage, now, children }: { stage: Stage; now: Week | null; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const total = stage.ahead.length + stage.done.length;
  const left = now === null ? null : stage.end - now;
  return (
    <Card size="md" className="flex flex-col gap-2">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-11 flex-col gap-1.5 text-left">
        <span className="flex w-full items-baseline justify-between gap-3">
          <span className="font-semibold text-fg-strong">{stage.title}</span>
          <span className="shrink-0 text-xs text-fg-subtle">
            {weekLabel(stage.end)}
            {left === null ? null : left <= 0 ? " · this week" : ` · in ${left} ${left === 1 ? "week" : "weeks"}`}
          </span>
        </span>
        {open ? null : (
          <span className="flex flex-col text-sm text-fg-normal">
            {stage.ahead.slice(0, PREVIEW).map(({ task }) => (
              <span key={task.id}>{task.title}</span>
            ))}
            {stage.ahead.length > PREVIEW ? <span className="text-fg-subtle">and {stage.ahead.length - PREVIEW} more</span> : null}
          </span>
        )}
        <span className="flex w-full items-center gap-2 text-xs text-fg-subtle">
          <span aria-hidden className="flex flex-wrap gap-1">
            {Array.from({ length: total }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the dots are a count, nothing more
              <span key={i} className={`size-2 rounded-full ${i < stage.done.length ? "bg-fg-brand" : "border border-border-normal"}`} />
            ))}
          </span>
          <span>
            {stage.done.length} of {total} done
          </span>
          <ChevronDown aria-hidden size={16} className={`ml-auto ${open ? "rotate-180 transition-transform" : "transition-transform"}`} />
        </span>
      </button>
      {open ? <div className="flex flex-col">{children}</div> : null}
    </Card>
  );
}

function Group({ title, count, folded = false, children }: { title: string; count: number; folded?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!folded);
  const heading = (
    <>
      <span>{title}</span>
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
