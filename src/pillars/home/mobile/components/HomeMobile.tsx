import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { LookThrough } from "../../../../app/features/itsTime/components/wayIn/LookThrough";
import { AskNow } from "../../../../app/features/settings/components/askNow/AskNow";
import { OfferExtra } from "../../../../app/features/settings/components/offerExtra/OfferExtra";
import { Calls } from "../../../journal/components/thisWeek/Calls";
import { HardFortnight } from "../../../journal/features/feelings/components/fortnight/HardFortnight";
import { DayByDay } from "../../components/dayByDay/DayByDay";
import { BestDoneThatWeek } from "../../components/doing/BestDoneThatWeek";
import { HeadsUp } from "../../components/headsUp/HeadsUp";
import { Part } from "../../components/Part";
import { AppointmentsThatWeek } from "../../components/week/AppointmentsThatWeek";
import { AskedThatWeek } from "../../components/week/AskedThatWeek";
import { KeptThatWeek } from "../../components/week/KeptThatWeek";
import { WorthKnowing } from "../../components/worthKnowing/WorthKnowing";
import { useHomePage } from "../../contexts/HomePageContext";
import { useTheOneThing } from "../hooks/useTheOneThing";
import { AtAGlance } from "./AtAGlance";
import { OtherNews } from "./OtherNews";
import { TheOneThing } from "./TheOneThing";
import { WeekTop } from "./WeekTop";

/**
 * Home on a phone: a dashboard of what's now. Where you are (`WeekTop`); a call
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
        <WeekTop />
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

/**
 * A week other than this one (or before there's a due date): the week as it
 * was, or will be. What was best done then; the day by day and its heads-up;
 * its appointments, what was asked and kept then, and what's worth knowing as
 * it starts.
 */
function AWeek() {
  const { peeking, week } = useHomePage();
  return (
    <PillarLayout>
      <div className="flex flex-col gap-8">
        <WeekTop />
        {peeking ? <BestDoneThatWeek /> : null}
        <Part>
          <DayByDay key={week} />
        </Part>
        <Part>
          <HeadsUp />
        </Part>
        <Part>
          <AppointmentsThatWeek />
        </Part>
        <Part>
          <AskedThatWeek />
        </Part>
        <Part>
          <KeptThatWeek />
        </Part>
        <Part>
          <WorthKnowing key={week} />
        </Part>
      </div>
    </PillarLayout>
  );
}
