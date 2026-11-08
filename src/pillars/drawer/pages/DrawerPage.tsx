import { Baby, Grid3x3, type LucideIcon, Scale, Users } from "lucide-react";
import type { ComponentType } from "react";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { PillarLayout } from "../../../app/components/layout/PillarLayout";
import { extrasOn } from "../../../lib/extras";
import { ToolOff } from "../components/tools/ToolOff";
import { ToolTile } from "../components/tools/ToolTile";
import { BingoSummary } from "../features/bingo/components/summary/BingoSummary";
import { CircleSummary } from "../features/circle/components/summary/CircleSummary";
import { JobsSummary } from "../features/jobs/components/summary/JobsSummary";
import { NamesSummary } from "../features/names/components/summary/NamesSummary";
import { TOOLS, type ToolId } from "../model/tools";

/** Each tool's icon, and its own line of where it's up to. */
const TILES: Record<ToolId, { icon: LucideIcon; Summary: ComponentType }> = {
  names: { icon: Baby, Summary: NamesSummary },
  people: { icon: Users, Summary: CircleSummary },
  jobs: { icon: Scale, Summary: JobsSummary },
  bingo: { icon: Grid3x3, Summary: BingoSummary },
};

/**
 * The handy things, each for its moment: the names (with the Choosing a name extra), your people (with any extra
 * that brings one of its views), who does what and bingo (each with its extra). While something has happened, they're put away,
 * not deleted: the route draws its quiet world (`putAway`).
 */
export function DrawerPage() {
  const { data: extras } = useExtrasQuery({ select: extrasOn });

  return (
    <PillarLayout width="full" title="Drawer" lead="The handy things, kept where you can find them when their moment comes." className="gap-6">
      {/* One under another on a phone; on a desktop tiles side by side, all four in a row on a wide screen. */}
      <div className="flex flex-col gap-6 desktop:grid desktop:grid-cols-2 desktop:gap-4 desktop:2xl:grid-cols-4">
        {(Object.keys(TOOLS) as ToolId[]).map((id) => {
          const tool = TOOLS[id];
          const { icon, Summary } = TILES[id];
          return tool.extras.some((e) => extras.has(e)) ? (
            // The names lead, with the accent.
            <ToolTile key={id} to={tool.to} icon={icon} title={tool.title} featured={id === "names"}>
              <Summary />
            </ToolTile>
          ) : (
            <ToolOff key={id} icon={icon} title={tool.title} extras={tool.extras}>
              {tool.off}
            </ToolOff>
          );
        })}
      </div>
    </PillarLayout>
  );
}
