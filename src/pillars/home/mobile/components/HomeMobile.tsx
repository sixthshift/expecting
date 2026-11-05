import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { LookThrough } from "../../../../app/features/itsTime/components/wayIn/LookThrough";
import { AskNow } from "../../../../app/features/settings/components/askNow/AskNow";
import { OfferExtra } from "../../../../app/features/settings/components/offerExtra/OfferExtra";
import { Calls } from "../../../journal/components/thisWeek/Calls";
import { HardFortnight } from "../../../journal/features/feelings/components/fortnight/HardFortnight";
import { BestDoneThatWeek } from "../../components/doing/BestDoneThatWeek";
import { WeekHeader } from "../../components/header/WeekHeader";
import { Part } from "../../components/Part";
import { WeekKept, WeekReads } from "../../components/week/TheWeek";
import { useHomePage } from "../../contexts/HomePageContext";
import { useTheOneThing } from "../hooks/useTheOneThing";
import { AtAGlance } from "./AtAGlance";
import { OtherNews } from "./OtherNews";
import { TheOneThing } from "./TheOneThing";

/**
 * Home on a phone: a dashboard of what's now. Where you are in a line; a call
 * to make above everything, if there is one; then the one thing that matters
 * most, shown whole with its action, and what's then; the other of you, in a
 * line; what Expecting needs to ask; then To do, To keep and To read as
 * numbers over the folds that hold them, and today's read and what's coming,
 * each folded to a line. A week peeked at is that week's page: what was best
 * done then, its reads and what was kept.
 */
export function HomeMobile() {
  const { peeking } = useHomePage();
  const one = useTheOneThing();
  if (peeking || !one) return <AWeek />;
  return (
    <PillarLayout>
      <div className="flex flex-col gap-5">
        <WeekHeader />
        <Part>
          <Calls />
        </Part>
        <Part>
          <LookThrough />
        </Part>
        <Part>
          <HardFortnight />
        </Part>
        <TheOneThing thing={one.thing} after={one.after} />
        <Part>
          <OtherNews />
        </Part>
        <Part>
          <AskNow />
        </Part>
        <Part>
          <OfferExtra />
        </Part>
        <AtAGlance shown={one.thing.kind} />
      </div>
    </PillarLayout>
  );
}

/** A week other than this one (or before there's a due date): the week as it was, or will be. */
function AWeek() {
  const { peeking } = useHomePage();
  return (
    <PillarLayout>
      <div className="flex flex-col gap-8">
        <WeekHeader />
        {peeking ? <BestDoneThatWeek /> : null}
        <WeekReads />
        <WeekKept />
      </div>
    </PillarLayout>
  );
}
