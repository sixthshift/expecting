import { useAppointmentsQuery } from "../../../../api/rpc/appointments";
import { useQuestionsQuery } from "../../../../api/rpc/questions";
import { LookThrough } from "../../../../app/features/itsTime/components/wayIn/LookThrough";
import { AskNow } from "../../../../app/features/settings/components/askNow/AskNow";
import { OfferExtra } from "../../../../app/features/settings/components/offerExtra/OfferExtra";
import { appointmentSoon, nextAppointment } from "../../../../lib/planner/appointments";
import { CheckIn } from "../../../journal/features/feelings/components/checkIn/CheckIn";
import { HardFortnight } from "../../../journal/features/feelings/components/fortnight/HardFortnight";
import { NextAppointment } from "../../../planner/features/appointments/components/NextAppointment";
import { QuestionsWaiting } from "../../../planner/features/questions/components/QuestionsWaiting";
import { ComingUp } from "../../../planner/features/tasks/components/comingUp/ComingUp";
import { ToDoNow } from "../../../planner/features/tasks/components/toDoNow/ToDoNow";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { WeeklyCard } from "../../features/weekly/components/WeeklyCard";
import { Part } from "../Part";

/**
 * The doing, this week, in three runs that each layout places: what's now
 * (`DoingFirst`), what's asked of you this week (`DoingAsked`) and what's
 * ahead (`DoingAhead`). On a desktop they're one column on the right
 * (`DoingNow`); on a phone the week's reads come between them.
 */
export function DoingNow() {
  return (
    <>
      <DoingFirst />
      <DoingAsked />
      <DoingAhead />
    </>
  );
}

/** Now: It's time's look through once it's near, the next appointment once it's close, what to do now, and how you are. */
export function DoingFirst() {
  return (
    <>
      <Part>
        <LookThrough />
      </Part>
      <Part>
        <NextAppointment />
      </Part>
      <div>
        <ToDoNow />
      </div>
      <Part>
        <HardFortnight />
      </Part>
      <Part>
        <CheckIn />
      </Part>
    </>
  );
}

/** Asked of you this week: the week's question, and what Expecting needs to know. */
export function DoingAsked() {
  return (
    <>
      <Part>
        <WeeklyCard />
      </Part>
      <Part>
        <AskNow />
      </Part>
    </>
  );
}

/** Ahead: an extra to offer, what's coming, and the questions waiting while no appointment is near (it brings them itself once one is). */
export function DoingAhead() {
  const { today } = useThisWeekPage();
  const { data: questions } = useQuestionsQuery();
  const { data: appointments } = useAppointmentsQuery();
  const openQuestions = questions.filter((q) => !q.askedAt).length;
  const next = nextAppointment(appointments, today);
  const nextSoon = next !== null && appointmentSoon(next, today) !== null;
  return (
    <>
      <Part>
        <OfferExtra />
      </Part>
      <Part>
        <ComingUp />
      </Part>
      {openQuestions > 0 && !nextSoon ? (
        <div>
          <QuestionsWaiting count={openQuestions} />
        </div>
      ) : null}
    </>
  );
}
