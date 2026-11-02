import type { ReactNode } from "react";
import { useChecklistQuery } from "../../../../api/rpc/checklist";
import type { Task } from "../../../../content/schema";
import { TaskRow } from "../../../../features/tasks/components/TaskRow";
import { Whose } from "../../../../features/tasks/components/Whose";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { Why } from "./Why";

/** One of To do's tasks: its tick, when (`when`) and whose under it, and why. Ticked, it stays put until the next visit. */
export function TaskLine({ task, when }: { task: Task; when?: ReactNode }) {
  const { stay } = usePlannerPage();
  const { data: ticked } = useChecklistQuery({ select: (c) => Boolean(c.ticks[task.id]) });
  return (
    <TaskRow
      task={task}
      ticked={ticked}
      stack
      meta={
        <span className="flex flex-wrap items-center gap-x-2">
          {when}
          <Whose who={task.who} />
        </span>
      }
      onTick={(next) => next && stay(task.id)}
      action={<Why task={task} />}
    />
  );
}
