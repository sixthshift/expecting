import { Link } from "@tanstack/react-router";
import { whose } from "../../lib/people";
import { weekLabel } from "../../lib/timeline";
import { comingUp } from "../../lib/todo";
import { useApp } from "../household/useApp";

/** How many Coming up shows; the Planner has the rest. */
const SHOWN = 5;

/**
 * The heads-up after To do now: what falls in the weeks after it, by week, so
 * nothing arrives as a surprise. Each one goes to why it matters.
 */
export function ComingUp() {
  const { state, now, tasks } = useApp();
  if (now === null) return null;
  const list = comingUp(tasks, state.ticks, now).slice(0, SHOWN);
  if (list.length === 0) return null;

  return (
    <section aria-labelledby="coming-up" className="flex flex-col gap-2">
      <h2 id="coming-up" className="text-lg font-semibold text-fg-strong">
        Coming up
      </h2>
      <ul className="flex flex-col">
        {list.map(({ task, week, deadline }) => {
          const row = (
            <>
              <span className="w-16 shrink-0 text-sm text-fg-subtle tabular-nums">{weekLabel(week)}</span>
              <span className="flex flex-1 flex-col">
                <span className="text-fg-normal">{task.title}</span>
                <span className="text-xs text-fg-subtle">
                  {deadline ? "deadline" : "best done by then"}
                  {task.who === "together" ? null : ` · ${whose(task.who, state.me, state.people)}`}
                </span>
              </span>
            </>
          );
          return (
            <li key={task.id}>
              {task.itemId ? (
                <Link to="/library/$itemId" params={{ itemId: task.itemId }} className="flex min-h-11 items-baseline gap-3 py-1.5 hover:text-fg-strong">
                  {row}
                </Link>
              ) : (
                <div className="flex min-h-11 items-baseline gap-3 py-1.5">{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
