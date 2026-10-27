import { Card } from "@sixthshift/design-system/card";
import { useRouter } from "@tanstack/react-router";
import { addDays, todayISO } from "../../../lib/dates";
import { STAGE } from "../../../lib/onboarding";
import { saveAnswer, saveHousehold } from "../../../server/functions/household";
import { AddTask, DeleteOwnTask } from "../../AddTask";
import { useApp } from "../../app";
import { DateForm } from "../../DateForm";
import { ItemCard } from "../../ItemCard";
import { PillarHeader } from "../../shell/Frame";
import { TaskRow } from "../../TaskRow";

/**
 * Getting ready's home: what's best done before a pregnancy, or very early in
 * one. Saying "we're expecting" with a due date moves Expecting into the
 * pregnancy, timeline and all.
 */
export function PreconceptionHome() {
  const { state, items, tasks } = useApp();
  const router = useRouter();
  const today = todayISO();
  const before = items.filter((i) => i.from.phase === "before");
  const standalone = tasks.filter((t) => t.itemId === null && t.due.phase === "before");

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
          <AddTask slot={{ phase: "before" }} />
        </div>
        <Card size="lg" className="lg:sticky lg:top-10">
          <DateForm
            label="Expecting? When's the baby due?"
            description="Your best estimate is fine; change it after the dating scan. Expecting moves on to the pregnancy, week by week."
            value={null}
            submitLabel="We're expecting"
            minDate={addDays(today, -7 * 3)}
            maxDate={addDays(today, 7 * 44)}
            onSave={async (date) => {
              await saveHousehold({ data: { dueDate: date } });
              await saveAnswer({ data: { question: STAGE, answer: "pregnant" } });
              await router.invalidate();
            }}
          />
        </Card>
      </div>
    </main>
  );
}
