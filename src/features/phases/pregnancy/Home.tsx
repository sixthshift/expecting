import { Link, useNavigate } from "@tanstack/react-router";
import { Baby, CalendarRange, Camera, ChevronRight, Luggage, Timer } from "lucide-react";
import { Coming } from "../../../components/Coming";
import { weekNotes } from "../../../content";
import { buildBands } from "../../../lib/timelineView";
import { PillarHeader } from "../../app/PillarLayout";
import { useApp } from "../../household/useApp";
import { QuestionsWaiting } from "../../questions/questions";
import { Week } from "../../weeks/Week";
import { NowLine, Welcome } from "./Now";

/**
 * The pregnancy's home: where you are, this week's note, what to do and what
 * has slipped, the questions waiting, and the tools for the moment. The
 * timeline is the whole pregnancy; this is the week you're in.
 */
export function PregnancyHome() {
  const { state, questions, today, position, now, items, tasks } = useApp();
  const navigate = useNavigate();
  const { dueDate, birthDate } = state.household;
  const band = buildBands({ notes: weekNotes, items, tasks, ticks: state.ticks, questions, now, dueDate, birthDate }).find((b) => b.isNow);
  const openQuestions = questions.filter((q) => !q.askedAt).length;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
      <PillarHeader title="This week" />
      {!dueDate ? <Welcome /> : null}
      {band ? (
        <Week
          band={band}
          expanded
          onToggle={() => {}}
          ticks={state.ticks}
          onOpenItem={(itemId) => navigate({ to: "/pregnancy/library/$itemId", params: { itemId } })}
          dueDate={dueDate}
          birthDate={birthDate}
          nowContent={
            <>
              {position && dueDate ? <NowLine position={position} dueDate={dueDate} today={today} /> : null}
              {openQuestions > 0 ? <QuestionsWaiting count={openQuestions} /> : null}
            </>
          }
          register={() => {}}
        />
      ) : null}
      <Link to="/pregnancy/timeline" className="mt-2 flex min-h-11 w-fit items-center gap-2 rounded-md text-sm text-fg-subtle hover:text-fg-normal">
        <CalendarRange aria-hidden size={16} className="text-fg-brand" />
        The whole pregnancy, week by week
        <ChevronRight aria-hidden size={16} />
      </Link>

      <section aria-labelledby="tools" className="mt-10 flex flex-col gap-3">
        <h2 id="tools" className="text-lg font-semibold text-fg-strong">
          Tools
        </h2>
        <Coming
          things={[
            {
              icon: Baby,
              title: "Baby names",
              about: "Swipe through names on your own phones; a name is a match only when you both like it. Then a shortlist.",
            },
            {
              icon: Camera,
              title: "Bump booth",
              about: "A bump photo each week, with last week's showing faintly so you match the pose. At the birth, it plays back as a time-lapse.",
            },
            { icon: Timer, title: "Contraction timer", about: "How long, how far apart, and when it's time to call." },
            { icon: Luggage, title: "Hospital bag", about: "What to pack, ticked off together." },
          ]}
        />
      </section>
    </main>
  );
}
