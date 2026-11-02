import { useQuestionsQuery } from "../../../../api/rpc/questions";
import { APPOINTMENT_WHEN } from "../../../../lib/appointments";
import { todayISO } from "../../../../lib/dates";
import { when } from "../../../../lib/labels";
import { usePlannerPage } from "../../contexts/PlannerPageContext";
import { AddQuestion } from "../../features/questions/components/AddQuestion";
import { AskedQuestion } from "../../features/questions/components/AskedQuestion";
import { OpenQuestion } from "../../features/questions/components/OpenQuestion";
import { Fold } from "../Fold";

/** The questions, for the next appointment (named, when there is one): a way to add one, those still to ask, and those asked folded away. */
export function ForNextAppointment() {
  const { next } = usePlannerPage().appointments;
  const { data: questions } = useQuestionsQuery();
  const open = questions.filter((q) => !q.askedAt);
  const asked = questions.filter((q) => q.askedAt);
  return (
    <section id="questions" aria-labelledby="questions-heading" className="flex scroll-mt-6 flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 id="questions-heading" className="text-lg font-display font-semibold text-fg-strong">
          For the next appointment
        </h2>
        {next ? (
          <p className="text-sm text-fg-subtle">
            {next.title}, {when(next.day, next.time, todayISO(), APPOINTMENT_WHEN)}
          </p>
        ) : null}
      </div>
      <AddQuestion />
      {open.length === 0 ? <p className="text-sm text-fg-subtle">Nothing to ask yet. Add a question as it comes to you.</p> : null}
      {open.map((q) => (
        <OpenQuestion key={q.id} question={q} />
      ))}
      {asked.length > 0 ? (
        <Fold title="Asked" count={asked.length} folded>
          <div className="flex flex-col gap-3">
            {asked.map((q) => (
              <AskedQuestion key={q.id} question={q} />
            ))}
          </div>
        </Fold>
      ) : null}
    </section>
  );
}
