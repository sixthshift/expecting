import { Baby, Grid3x3, Scale, Users } from "lucide-react";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useQuietQuery } from "../../../api/rpc/quiet";
import { PillarHeader } from "../../../app/components/layout/PillarLayout";
import { PutAwayNotice } from "../../../app/features/quiet/components/PutAwayNotice";
import { BingoSummary } from "../../../features/bingo/components/summary/BingoSummary";
import { CircleSummary } from "../../../features/circle/components/summary/CircleSummary";
import { CIRCLE_EXTRAS } from "../../../features/circle/model/extras";
import { JobsSummary } from "../../../features/jobs/components/summary/JobsSummary";
import { NamesSummary } from "../../../features/names/components/summary/NamesSummary";
import { extrasOn } from "../../../lib/extras";
import { ToolOff } from "../components/tools/ToolOff";
import { ToolTile } from "../components/tools/ToolTile";

/**
 * The handy things, each for its moment: the names (with the Choosing a name extra), your people (with any extra
 * that brings one of its views), who does what and bingo (each with its extra). While something has happened, they're put away,
 * not deleted.
 */
export function DrawerPage() {
  const { data: extras } = useExtrasQuery({ select: extrasOn });
  const { data: quiet } = useQuietQuery();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 md:px-8">
      <PillarHeader title="Drawer" lead="The handy things, kept where you can find them when their moment comes." />
      {quiet ? (
        <PutAwayNotice subject="The names and everything else here" are className="max-w-prose" />
      ) : (
        <>
          {extras.has("choosing-names") ? (
            <ToolTile to="/drawer/names" icon={Baby} title="Baby names" featured>
              <NamesSummary />
            </ToolTile>
          ) : (
            <ToolOff icon={Baby} title="Baby names" extras={["choosing-names"]}>
              swipe through names on your own phones; a name is a match only when you both like it.
            </ToolOff>
          )}
          {CIRCLE_EXTRAS.some((id) => extras.has(id)) ? (
            <ToolTile to="/drawer/people" icon={Users} title="Your people">
              <CircleSummary />
            </ToolTile>
          ) : (
            <ToolOff icon={Users} title="Your people" extras={CIRCLE_EXTRAS}>
              who visits, who hears first, who helps, and who gave what, kept by you both.
            </ToolOff>
          )}
          {extras.has("who-does-what") ? (
            <ToolTile to="/drawer/jobs" icon={Scale} title="Who does what">
              <JobsSummary />
            </ToolTile>
          ) : (
            <ToolOff icon={Scale} title="Who does what" extras={["who-does-what"]}>
              each of you says who'll do each newborn job, then you see where you agree.
            </ToolOff>
          )}
          {extras.has("pregnancy-bingo") ? (
            <ToolTile to="/drawer/bingo" icon={Grid3x3} title="Pregnancy bingo">
              <BingoSummary />
            </ToolTile>
          ) : (
            <ToolOff icon={Grid3x3} title="Pregnancy bingo" extras={["pregnancy-bingo"]}>
              a card each of the things people say and do, first to a line wins.
            </ToolOff>
          )}
        </>
      )}
    </main>
  );
}
