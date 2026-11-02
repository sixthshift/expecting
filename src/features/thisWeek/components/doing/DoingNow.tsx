import { useAppointmentsQuery } from "../../../../api/rpc/appointments";
import { useQuestionsQuery } from "../../../../api/rpc/questions";
import { appointmentSoon, nextAppointment } from "../../../../lib/appointments";
import { NextAppointment } from "../../../appointments/components/NextAppointment";
import { CheckIn } from "../../../feelings/components/checkIn/CheckIn";
import { HardFortnight } from "../../../feelings/components/fortnight/HardFortnight";
import { LookThrough } from "../../../itsTime/components/wayIn/LookThrough";
import { QuestionsWaiting } from "../../../questions/components/QuestionsWaiting";
import { AskNow } from "../../../settings/components/askNow/AskNow";
import { OfferExtra } from "../../../settings/components/offerExtra/OfferExtra";
import { ComingUp } from "../../../tasks/components/comingUp/ComingUp";
import { ToDoNow } from "../../../tasks/components/toDoNow/ToDoNow";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { WeeklyCard } from "../weeklyCard/WeeklyCard";

/**
 * The doing, this week: the next appointment once it's close, what to do now,
 * how you are, the week's question, what Expecting needs to know, an extra to
 * offer, what's coming, and the questions waiting while no appointment is near.
 * Each in its phone `order` among the week's parts.
 */
export function DoingNow() {
  const { today } = useThisWeekPage();
  const { data: questions } = useQuestionsQuery();
  const { data: appointments } = useAppointmentsQuery();
  const openQuestions = questions.filter((q) => !q.askedAt).length;
  // The next appointment is here once it's close, and with it the questions.
  const next = nextAppointment(appointments, today);
  const nextSoon = next !== null && appointmentSoon(next, today) !== null;

  return (
    <>
      <div className="order-1 empty:hidden lg:order-0">
        <LookThrough />
      </div>
      <div className="order-1 empty:hidden lg:order-0">
        <NextAppointment />
      </div>
      <div className="order-1 lg:order-0">
        <ToDoNow />
      </div>
      <div className="order-1 empty:hidden lg:order-0">
        <HardFortnight />
      </div>
      <div className="order-1 empty:hidden lg:order-0">
        <CheckIn />
      </div>
      <div className="order-3 empty:hidden lg:order-0">
        <WeeklyCard />
      </div>
      <div className="order-3 empty:hidden lg:order-0">
        <AskNow />
      </div>
      <div className="order-5 empty:hidden lg:order-0">
        <OfferExtra />
      </div>
      <div className="order-5 empty:hidden lg:order-0">
        <ComingUp />
      </div>
      {openQuestions > 0 && !nextSoon ? (
        <div className="order-6 lg:order-0">
          <QuestionsWaiting count={openQuestions} />
        </div>
      ) : null}
    </>
  );
}
