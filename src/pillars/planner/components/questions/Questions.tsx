import type { ReactNode } from "react";
import { useAppointmentsQuery } from "../../../../api/rpc/appointments";
import { useQuestionsQuery } from "../../../../api/rpc/questions";
import { todayISO } from "../../../../lib/dates";
import { appointmentName } from "../../../../lib/planner/appointments";
import { openFor, type Question, questionsByAppointment } from "../../../../lib/planner/questions";
import { AddQuestion } from "../../features/questions/components/AddQuestion";
import { AskedQuestion } from "../../features/questions/components/AskedQuestion";
import { NoneBooked } from "../../features/questions/components/NoneBooked";
import { OpenQuestion } from "../../features/questions/components/OpenQuestion";
import { Fold } from "../Fold";

/**
 * The questions, each for an appointment: a way to add one, then those to ask
 * at each appointment still ahead (the next always), those left unasked at
 * one gone (they stay there until moved), those whose appointment was
 * deleted, and what was asked, by where, folded away.
 */
export function QuestionsSection() {
  const { data: questions } = useQuestionsQuery();
  const { data: appointments } = useAppointmentsQuery();
  const today = todayISO();
  const { ahead, missed, forNone, asked, askedAtNone } = questionsByAppointment(questions, appointments, today);
  const askedCount = asked.reduce((n, g) => n + g.questions.length, 0) + askedAtNone.length;
  return (
    <section id="questions" aria-labelledby="questions-heading" className="flex scroll-mt-6 flex-col gap-4">
      <h2 id="questions-heading" className="text-lg font-display font-semibold text-fg-strong">
        Questions
      </h2>
      <AddQuestion />
      {ahead.map(({ appointment, questions: open }, i) => (
        <Group key={appointment.id} title={appointmentName(appointment, today)} note={i === 0 ? "Next" : undefined}>
          <ToAsk questions={open} />
        </Group>
      ))}
      {missed.map(({ appointment, questions: open }) => (
        <Group key={appointment.id} title={`Not asked at ${appointmentName(appointment, today)}`} note="Asked after all, or still to ask? Move it to another.">
          {open.map((q) => (
            <OpenQuestion key={q.id} question={q} />
          ))}
        </Group>
      ))}
      {forNone.length > 0 ? (
        <Group title="Its appointment deleted" note="Move each to the appointment it's for.">
          {ahead.length === 0 ? <NoneBooked /> : null}
          {forNone.map((q) => (
            <OpenQuestion key={q.id} question={q} asked={false} />
          ))}
        </Group>
      ) : null}
      {askedCount > 0 ? (
        <Fold title="Asked" count={askedCount} folded>
          <div className="flex flex-col gap-4">
            {asked.map(({ appointment, questions: those }) => (
              <Group key={appointment.id} title={appointmentName(appointment, today)}>
                {those.map((q) => (
                  <AskedQuestion key={q.id} question={q} />
                ))}
              </Group>
            ))}
            {askedAtNone.length > 0 ? (
              <Group title="Without an appointment">
                {askedAtNone.map((q) => (
                  <AskedQuestion key={q.id} question={q} />
                ))}
              </Group>
            ) : null}
          </div>
        </Fold>
      ) : null}
    </section>
  );
}

/** Under the next appointment, in a desktop's Up next: what's to ask there, and a way to add to it. */
export function NextQuestions({ appointmentId }: { appointmentId: string }) {
  const { data: open } = useQuestionsQuery({ select: (questions) => openFor(questions, appointmentId) });
  return (
    <>
      <AddQuestion at={appointmentId} />
      <ToAsk questions={open} />
    </>
  );
}

/** What's still to ask at an appointment ahead, or that there's nothing yet. */
function ToAsk({ questions }: { questions: readonly Question[] }) {
  if (questions.length === 0) return <p className="text-sm text-fg-subtle">Nothing to ask yet. Add a question as it comes to you.</p>;
  return questions.map((q) => <OpenQuestion key={q.id} question={q} />);
}

function Group({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-3">
      <h3 className="flex flex-wrap items-baseline gap-x-2 border-b border-border-subtle pb-1.5">
        <span className="text-sm font-semibold text-fg-strong">{title}</span>
        {note ? <span className="text-xs text-fg-subtle">{note}</span> : null}
      </h3>
      {children}
    </section>
  );
}
