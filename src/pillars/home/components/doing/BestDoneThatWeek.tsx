import { useChecklistQuery } from "../../../../api/rpc/checklist";
import { ItemLink } from "../../../library/components/itemLink/ItemLink";
import { TaskRow } from "../../../planner/features/tasks/components/TaskRow";
import { useTasks } from "../../../planner/features/tasks/hooks/useTasks";
import { useHomePage } from "../../contexts/HomePageContext";

/** The doing, on a peek: what's best done that week, or falls due in it, each with why. What to do now stays with now. */
export function BestDoneThatWeek() {
  const { week } = useHomePage();
  const { data: checklist } = useChecklistQuery();
  const tasks = useTasks();
  const thatWeek = week === null ? [] : tasks.filter((t) => t.due === week || t.deadline === week);

  return (
    <section aria-labelledby="that-week" className="flex flex-col gap-2">
      <h2 id="that-week" className="text-lg font-display font-semibold text-fg-strong">
        Best done that week
      </h2>
      {thatWeek.length === 0 ? (
        <p className="text-fg-subtle">Nothing falls due that week.</p>
      ) : (
        <div className="flex flex-col">
          {thatWeek.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              ticked={Boolean(checklist.ticks[task.id])}
              meta={task.deadline === week ? "deadline" : undefined}
              action={
                task.itemId ? (
                  <ItemLink itemId={task.itemId} aria-label={`Why: ${task.title}`} className="shrink-0 px-1 text-xs text-fg-subtle underline">
                    Why
                  </ItemLink>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
