import type { ReactNode } from "react";
import { useExtrasQuery } from "../../../../api/rpc/extras";
import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import { extrasOn } from "../../../../lib/extras";
import type { Tool } from "../../model/tools";
import { ComesWith } from "../ComesWith";

/**
 * Every tool's page in the Drawer: a page of the pillar with the way back to
 * the Drawer, the tool's name and what it is (its `lead`, or one given). While
 * none of its extras is on, it says which it comes with. Only when it's on
 * are its `children` drawn. While something has happened the tool is put
 * away: its route draws its quiet world (`putAway`, the same way back, name
 * and lead).
 */
export function DrawerTool({
  tool,
  lead = tool.lead,
  children,
}: {
  tool: Pick<Tool, "title" | "lead" | "width" | "extras">;
  lead?: ReactNode;
  children: ReactNode;
}) {
  const { data: on } = useExtrasQuery({ select: extrasOn });
  return (
    <PillarLayout back={{ to: "/drawer", label: "The Drawer" }} title={tool.title} lead={lead} width={tool.width}>
      {tool.extras.some((id) => on.has(id)) ? (
        children
      ) : (
        <p className="text-sm text-fg-normal">
          <ComesWith extras={tool.extras} />
        </p>
      )}
    </PillarLayout>
  );
}
