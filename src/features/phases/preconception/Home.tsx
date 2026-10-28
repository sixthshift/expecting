import { Card } from "@sixthshift/design-system/card";
import { DateForm } from "../../../components/DateForm";
import { type ISODate, todayISO } from "../../../lib/dates";
import { EXPECTING } from "../../../lib/onboarding";
import { dueDateBounds } from "../../../lib/timeline";
import { saveAnswer, saveHousehold } from "../../../rpc/household";
import { PillarHeader } from "../../app/PillarLayout";
import { useAction } from "../../household/useAction";
import { useApp } from "../../household/useApp";
import { ItemCard } from "../../library/ItemCard";
import { AddTask, DeleteOwnTask } from "../../tasks/AddTask";
import { TaskRow } from "../../tasks/TaskRow";

/**
 * Getting ready's home: what's best done before a pregnancy, or very early in
 * one. Saying "we're expecting" with a due date moves Expecting into the
 * pregnancy, timeline and all.
 */
export function PreconceptionHome() {
  const { state, items, tasks } = useApp();
  // The due date moves Expecting into the pregnancy; the answer keeps onboarding's question in step.
  const [expecting] = useAction(async (dueDate: ISODate | null) => {
    await saveHousehold({ data: { dueDate } });
    await saveAnswer({ data: { question: EXPECTING, answer: "yes" } });
  });
  const today = todayISO();
  const before = items.filter((i) => i.from.phase === "preconception");
  const standalone = tasks.filter((t) => t.itemId === null && t.due.phase === "preconception");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader
        title="Getting ready"
        lead="The things worth doing before a pregnancy, or very early in one. Some of them take months, so they're worth starting now."
      />
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-10">
        <div className="flex flex-col gap-4">
          {before.map((item) => (
            <ItemCard key={item.id} item={item} ticks={state.ticks} />
          ))}
          {standalone.length > 0 ? (
            <div className="flex flex-col">
              {standalone.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  ticked={Boolean(state.ticks[task.id])}
                  action={task.origin === "own" ? <DeleteOwnTask task={task} /> : null}
                />
              ))}
            </div>
          ) : null}
          <AddTask slot={{ phase: "preconception" }} />
        </div>
        <Card size="lg" className="lg:sticky lg:top-10">
          <DateForm
            label="Expecting? When's the baby due?"
            description="Your best estimate is fine; change it after the dating scan. Expecting moves on to the pregnancy, week by week."
            value={null}
            submitLabel="We're expecting"
            {...dueDateBounds(today)}
            onSave={expecting}
          />
        </Card>
      </div>
    </main>
  );
}
