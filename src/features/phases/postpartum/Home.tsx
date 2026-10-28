import { useNavigate } from "@tanstack/react-router";
import { weekNotes } from "../../../content";
import { ageLabel, slotLabel } from "../../../lib/timeline";
import { buildBands } from "../../../lib/timelineView";
import { PillarHeader } from "../../app/PillarLayout";
import { useApp } from "../../household/useApp";
import { QuestionsWaiting } from "../../questions/questions";
import { ToDoNow } from "../../tasks/ToDoNow";
import { Week } from "../../weeks/Week";

/**
 * The baby's here, and home is this week: what to do now, most urgent first,
 * then what matters this week. The weeks are still there, but they're no longer the thread.
 */
export function PostpartumHome() {
  const { state, questions, position, now, items, tasks } = useApp();
  const navigate = useNavigate();
  const { dueDate, birthDate } = state.household;
  const band = buildBands({ notes: weekNotes, items, tasks, ticks: state.ticks, questions, now, dueDate, birthDate }).find((b) => b.isNow);
  const age = ageLabel(position?.daysSinceBirth ?? 0);
  const openQuestions = questions.filter((q) => !q.askedAt).length;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="This week" lead={now ? `${age} · ${slotLabel(now).toLowerCase()}` : age} />
      <ToDoNow />
      {band ? (
        <Week
          // What has slipped is in To do now, above.
          band={{ ...band, slipped: [] }}
          expanded
          onToggle={() => {}}
          ticks={state.ticks}
          onOpenItem={(itemId) => navigate({ to: "/postpartum/library/$itemId", params: { itemId } })}
          dueDate={dueDate}
          birthDate={birthDate}
          nowContent={openQuestions > 0 ? <QuestionsWaiting count={openQuestions} /> : null}
          register={() => {}}
        />
      ) : null}
    </main>
  );
}
