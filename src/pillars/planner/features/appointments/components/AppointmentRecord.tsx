import { useQuestionsQuery } from "../../../../../api/rpc/questions";

/**
 * Under an appointment gone by: what you asked there and what you were told,
 * and what was left unasked (waiting in Questions until it's moved).
 */
export function AppointmentRecord({ appointmentId }: { appointmentId: string }) {
  const { data: there } = useQuestionsQuery({ select: (questions) => questions.filter((q) => q.appointmentId === appointmentId) });
  const asked = there.filter((q) => q.askedAt !== null);
  const unasked = there.length - asked.length;
  if (there.length === 0) return null;
  return (
    <section aria-label="What you asked" className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-3">
      {asked.map((q) => (
        <div key={q.id} className="text-sm">
          <p className="whitespace-pre-wrap font-medium text-fg-normal">{q.text}</p>
          {q.answer ? <p className="whitespace-pre-wrap text-fg-normal">{q.answer}</p> : null}
        </div>
      ))}
      {unasked > 0 ? (
        <p className="text-xs text-fg-subtle">
          {unasked === 1 ? "1 question not asked: it's in Questions." : `${unasked} questions not asked: they're in Questions.`}
        </p>
      ) : null}
    </section>
  );
}
