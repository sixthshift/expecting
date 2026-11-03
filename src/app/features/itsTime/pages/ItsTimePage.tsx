import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useEffect } from "react";
import { useItsTimeQuery } from "../../../../api/rpc/itsTime";
import { BeforeYouGo } from "../components/beforeYouGo/BeforeYouGo";
import { CallNow } from "../components/callNow/CallNow";
import { End } from "../components/end/End";
import { GettingThere } from "../components/gettingThere/GettingThere";
import { Ready } from "../components/ready/Ready";
import { TheyllAsk } from "../components/theyllAsk/TheyllAsk";
import { Timer } from "../components/timer/Timer";
import { Top } from "../components/top/Top";
import { Waters } from "../components/waters/Waters";
import { ItsTimePageProvider, useItsTimePage } from "../contexts/ItsTimePageContext";
import { markLooked } from "../model/looked";

/** How long after a false alarm the page says so, kindly. */
const SENT_HOME_MS = 12 * 3_600_000;

/**
 * It's time: one page for the night it starts. What's happening, who to ring,
 * what they'll ask, what to grab and how to get there, in that order, with
 * everything Expecting already knows filled in. Before a start it's the
 * practice run: the two ways in, what the night still needs, and the rest of
 * the page greyed, as the night will show it. One column, the phone's, even
 * on a desktop. Never while something has happened: the route's quiet world
 * (`worlds`) is Emergency info instead, `QuietItsTimePage`.
 *
 * One context, `ItsTimePageProvider`: the start, whether it's a home birth,
 * and who's who. Each part reads the rest itself.
 */
export function ItsTimePage() {
  return (
    <ItsTimePageProvider>
      <ItsTime />
    </ItsTimePageProvider>
  );
}

function ItsTime() {
  useEffect(markLooked, []);
  const { start } = useItsTimePage();
  const { data: latest } = useItsTimeQuery({ select: (t) => t.starts[0] });
  const sentHome = !start && latest?.ended === "home" && latest.endedAt && Date.now() - new Date(latest.endedAt).getTime() < SENT_HOME_MS;
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

        <Top />

        {start ? null : <Ready />}

        {left ? <GettingThere /> : null}

        <CallNow />

        {start ? (
          <>
            <Timer start={start} />
            <Waters start={start} />
          </>
        ) : null}

        {/* Before a start, the rest as the night will show it: the practice run. */}
        <div className={cn("flex flex-col gap-6", !start && "opacity-75")}>
          {start ? null : <h2 className="font-display text-lg font-semibold text-fg-strong">On the night, the rest of this page</h2>}
          <TheyllAsk />
          <BeforeYouGo />
          {left ? null : <GettingThere />}
        </div>

        {start ? <End /> : null}
      </div>
    </main>
  );
}
