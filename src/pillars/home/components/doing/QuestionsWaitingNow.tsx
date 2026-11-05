import { useAppointmentsQuery } from "../../../../api/rpc/appointments";
import { useQuestionsQuery } from "../../../../api/rpc/questions";
import { appointmentSoon, nextAppointment } from "../../../../lib/planner/appointments";
import { QuestionsWaiting } from "../../../planner/features/questions/components/QuestionsWaiting";
import { useHomePage } from "../../contexts/HomePageContext";

/** The questions waiting, while no appointment is near (it brings them itself once one is). */
export function QuestionsWaitingNow() {
  const { today } = useHomePage();
  const { data: questions } = useQuestionsQuery();
  const { data: appointments } = useAppointmentsQuery();
  const openQuestions = questions.filter((q) => !q.askedAt).length;
  const next = nextAppointment(appointments, today);
  const nextSoon = next !== null && appointmentSoon(next, today) !== null;
  return openQuestions > 0 && !nextSoon ? (
    <div>
      <QuestionsWaiting count={openQuestions} />
    </div>
  ) : null;
}
