import { useNavigate } from "@tanstack/react-router";
import { PillarHeader } from "../../features/app/PillarLayout";
import { useApp } from "../../features/household/useApp";
import { QuestionsWaiting } from "../../features/questions/questions";
import { Week } from "../../features/weeks/Week";
import { ageLabel, slotLabel } from "../../lib/timeline";
import { buildBands } from "../../lib/timelineView";

/**
 * The baby's here, and home is this week: what matters now, what has slipped,
 * and what to do. The weeks are still there, but they're no longer the thread.
 */
export function PostpartumHome() {
  const { state, questions, position, now, items, tasks } = useApp();
  const navigate = useNavigate();
  const { dueDate, birthDate } = state.household;
  const band = buildBands({ items, tasks, ticks: state.ticks, questions, now, dueDate, birthDate }).find((b) => b.isNow);
  const age = ageLabel(position?.daysSinceBirth ?? 0);
  const openQuestions = questions.filter((q) => !q.askedAt).length;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="This week" lead={now ? `${age} · ${slotLabel(now).toLowerCase()}` : age} />
      {band ? (
        <Week
          band={band}
          expanded
          onToggle={() => {}}
          ticks={state.ticks}
          onOpenItem={(itemId) => navigate({ to: "/library/$itemId", params: { itemId } })}
          dueDate={dueDate}
          birthDate={birthDate}
          nowContent={openQuestions > 0 ? <QuestionsWaiting count={openQuestions} /> : null}
          register={() => {}}
        />
      ) : null}
    </main>
  );
}
