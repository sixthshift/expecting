import { Button } from "@sixthshift/design-system/button";
import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useChecklist } from "../../../api/rpc/checklist";
import { useEmergency } from "../../../api/rpc/emergency";
import { useAnswers } from "../../../api/rpc/facts";
import { itsTimeSaves, useItsTime } from "../../../api/rpc/itsTime";
import { useLists } from "../../../api/rpc/lists";
import { usePeople } from "../../../api/rpc/people";
import { useQuiet } from "../../../api/rpc/quiet";
import { usePosition, useSettings } from "../../../api/rpc/settings";
import { Redirect } from "../../../app/components/Redirect";
import { useSave } from "../../../app/hooks/useSave";
import { todayISO } from "../../../lib/dates";
import { factsOf } from "../../../lib/facts";
import { type Ending, openStart, patternOf } from "../../../lib/itsTime";
import { LAST_THING } from "../../../lib/lists";
import { useLines } from "../../lists/hooks/useLines";
import { BeforeYouGo } from "../components/beforeYouGo/BeforeYouGo";
import { CallNow } from "../components/callNow/CallNow";
import { GettingThere } from "../components/gettingThere/GettingThere";
import { Ready } from "../components/ready/Ready";
import { TheyllAsk } from "../components/theyllAsk/TheyllAsk";
import { Timer } from "../components/timer/Timer";
import { Top } from "../components/top/Top";
import { Waters } from "../components/waters/Waters";
import { breechWaters } from "../model/callNow";
import { markLooked } from "../model/looked";
import { atHome, CAR_SEAT_TASK, stillToReady } from "../model/ready";
import { theyllAsk } from "../model/theyllAsk";

/** How long after a false alarm the page says so, kindly. */
const SENT_HOME_MS = 12 * 3_600_000;

/**
 * It's time: one page for the night it starts. What's happening, who to ring,
 * what they'll ask, what to grab and how to get there, in that order, with
 * everything Expecting already knows filled in. Before a start it's the
 * practice run: the two ways in, what the night still needs, and the rest of
 * the page greyed, as the night will show it. One column, the phone's, even
 * on a desktop. Never while something has happened: Emergency info instead.
 */
export function ItsTimePage() {
  const { data: quiet } = useQuiet();
  if (quiet) return <Redirect href="/emergency" />;
  return <ItsTime />;
}

function ItsTime() {
  useEffect(markLooked, []);
  const { data: itsTime } = useItsTime();
  const { values } = useEmergency().data;
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: people } = usePeople();
  const { data: settings } = useSettings();
  const { ticks } = useChecklist().data;
  const { marks } = useLists().data;
  const lines = useLines();
  const position = usePosition();
  const start = openStart(itsTime);
  const home = atHome(facts);
  const me = people.me;
  const partner = people.people.find((p) => p.role === "partner") ?? null;
  const carrying = people.people.find((p) => p.role === "carrying") ?? null;

  const bagLines = lines.filter((l) => l.listId === "bag");
  const packing = bagLines.filter((l) => l.section !== LAST_THING && marks[l.id]?.state !== "not-needed");
  const bag = { packed: packing.filter((l) => marks[l.id]?.state === "got").length, total: packing.length };
  const lastThings = bagLines.filter((l) => l.section === LAST_THING && marks[l.id]?.state !== "not-needed");

  const rows = theyllAsk({
    values,
    facts,
    carrying: carrying?.name ?? null,
    dueDate: settings.dueDate,
    today: todayISO(),
    start,
    pattern: start ? patternOf(start.contractions, new Date()) : null,
    holding: me?.role ?? null,
  });
  const latest = itsTime.starts[0];
  const sentHome = !start && latest?.ended === "home" && latest.endedAt && Date.now() - new Date(latest.endedAt).getTime() < SENT_HOME_MS;

  const gettingThere = <GettingThere values={values} home={home} />;
  const left = Boolean(start?.leftAt);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-10">
      <div className="flex max-w-xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <Link to="/emergency" className="-ml-2 flex min-h-11 w-fit items-center gap-1 rounded-md px-2 text-sm text-fg-subtle hover:text-fg-normal">
            <ChevronLeft aria-hidden size={16} /> Emergency info
          </Link>
          <h1 className="font-display text-2xl font-semibold text-fg-strong lg:text-3xl">It's time</h1>
        </header>

        {sentHome ? (
          <p className="rounded-xl bg-bg-subtle px-4 py-3 text-fg-normal">
            Sent home for now? That's common in early labour, which can be long and tiring. The contractions are kept for when it starts again.
          </p>
        ) : null}

        <Top start={start} position={position} values={values} home={home} breechWaters={breechWaters(facts, start)} me={me} partner={partner} />

        {start ? null : <Ready things={stillToReady({ values, facts, ticks })} home={home} />}

        {left ? gettingThere : null}

        <CallNow facts={facts} home={home} />

        {start ? (
          <>
            <Timer start={start} hospitalSaid={values.hospitalSaid} />
            <Waters start={start} />
          </>
        ) : null}

        {/* Before a start, the rest as the night will show it: the practice run. */}
        <div className={cn("flex flex-col gap-6", !start && "opacity-75")}>
          {start ? null : <h2 className="font-display text-lg font-semibold text-fg-strong">On the night, the rest of this page</h2>}
          <TheyllAsk rows={rows} hospitalSaid={start ? undefined : values.hospitalSaid} home={home} />
          <BeforeYouGo
            start={start}
            lastThings={lastThings}
            bag={bag}
            carSeatFitted={Boolean(ticks[CAR_SEAT_TASK])}
            ownLines={itsTime.lines}
            values={values}
            home={home}
            showMinder={facts.firstBaby === "no" || Boolean(values.minder)}
          />
          {left ? null : gettingThere}
        </div>

        {start ? <End home={home} /> : null}
      </div>
    </main>
  );
}

/** The end of a start: we're there, or a false alarm and home again. Asked twice: a stray tap shouldn't end the night. */
function End({ home }: { home: boolean }) {
  const end = useSave(itsTimeSaves.endStart);
  const [asking, setAsking] = useState<Ending | null>(null);
  const label: Record<Ending, string> = { there: home ? "The midwife's here" : "We're there", home: "False alarm, we're home" };
  if (asking) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-subtle p-4">
        <p className="text-fg-strong">
          {asking === "there" ? "End this start? The night is kept in the Journal." : "End this start? The contractions are kept here."}
        </p>
        <div className="flex gap-2">
          <Button intent="brand" onClick={() => end({ ended: asking })}>
            {label[asking]}
          </Button>
          <Button variant="outline" onClick={() => setAsking(null)}>
            Not yet
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 border-border-subtle border-t pt-6 sm:flex-row">
      <Button size="lg" variant="outline" className="min-h-14 flex-1" onClick={() => setAsking("there")}>
        {label.there}
      </Button>
      <Button size="lg" variant="ghost" className="min-h-14 flex-1" onClick={() => setAsking("home")}>
        {label.home}
      </Button>
    </div>
  );
}
