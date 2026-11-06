import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useAppointmentsQuery } from "../../../../../api/rpc/appointments";
import { useQuestionsQuery } from "../../../../../api/rpc/questions";
import { todayISO } from "../../../../../lib/dates";
import { dayOfMoment } from "../../../../../lib/labels";
import { appointmentName } from "../../../../../lib/planner/appointments";

/**
 * On a Library entry: the questions asked from it, open ones with the
 * appointment they wait for, and asked ones with where and what you were
 * told. Never under a private entry, which nothing can point at.
 */
export function QuestionsAbout({ itemId }: { itemId: string }) {
  const { data: about } = useQuestionsQuery({ select: (questions) => questions.filter((q) => q.itemId === itemId) });
  const { data: appointments } = useAppointmentsQuery();
  if (about.length === 0) return null;
  const today = todayISO();
  const at = (id: string | null) => appointments.find((a) => a.id === id);
  const open = about.filter((q) => !q.askedAt);
  // Most recently asked first.
  const asked = about.filter((q) => q.askedAt).sort((a, b) => b.askedAt!.localeCompare(a.askedAt!));
  return (
    <section aria-labelledby="your-questions" className="flex flex-col gap-2">
      <h2 id="your-questions" className="text-sm font-semibold text-fg-strong">
        Your questions
      </h2>
      <ul className="flex flex-col gap-2">
        {open.map((q) => {
          const forIt = at(q.appointmentId);
          return (
            <li key={q.id} className="rounded-lg border border-border-subtle p-3 text-sm">
              <p className="whitespace-pre-wrap text-fg-normal">{q.text}</p>
              <Link to="/planner/questions" className="mt-1 inline-flex items-center gap-1 text-xs text-fg-subtle hover:text-fg-normal">
                {forIt ? `To ask at ${appointmentName(forIt, today)}` : "Waiting for an appointment"} <ChevronRight aria-hidden size={14} />
              </Link>
            </li>
          );
        })}
        {asked.map((q) => {
          const where = at(q.appointmentId);
          return (
            <li key={q.id} className="rounded-lg border border-border-subtle p-3 text-sm">
              <p className="whitespace-pre-wrap font-medium text-fg-normal">{q.text}</p>
              <p className="mt-1 whitespace-pre-wrap text-fg-normal">
                <span className="text-fg-subtle">{where ? `You asked at ${appointmentName(where, today)}` : `You asked on ${dayOfMoment(q.askedAt!)}`}</span>
                {q.answer ? `: ${q.answer}` : "."}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
