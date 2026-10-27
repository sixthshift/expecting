import { useNavigate } from "@tanstack/react-router";
import { Band } from "../../components/timeline/Band";
import { QuestionsWaiting } from "../../components/timeline/Timeline";
import { slotLabel } from "../../lib/timeline";
import { buildBands } from "../../lib/timelineView";
import { PillarHeader } from "../Frame";
import { useApp } from "../useApp";

/**
 * The baby's here, and home is this week: what matters now, what has slipped,
 * and what to do. The weeks are still there, but they're no longer the thread.
 */
export function PostpartumHome() {
  const { state, questions, position, now, items, tasks } = useApp();
  const navigate = useNavigate();
  const { dueDate, birthDate } = state.household;
  const band = buildBands({ items, tasks, ticks: state.ticks, questions, now, dueDate, birthDate }).find((b) => b.isNow);
  const days = position?.daysSinceBirth ?? 0;
  const age = days === 0 ? "Born today" : `${days} ${days === 1 ? "day" : "days"} old`;
  const openQuestions = questions.filter((q) => !q.askedAt).length;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="This week" lead={now ? `${age} · ${slotLabel(now).toLowerCase()}` : age} />
      {band ? (
        <Band
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
