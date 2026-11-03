import type { ReactNode } from "react";
import { useExtrasQuery } from "../../../../api/rpc/extras";
import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import type { ExtraId } from "../../../../app/features/settings/model/extras";
import { extrasOn } from "../../../../lib/extras";
import { ComesWith } from "../ComesWith";

/**
 * Every tool's page in the Drawer: a page of the pillar with the way back to
 * the Drawer, the tool's name and what it is (`lead`). While none of its
 * `extras` is on, it says which it comes with. Only when it's on are its
 * `children` drawn. While something has happened the tool is put away: its
 * route draws its quiet world (`putAway`, the same way back, name and lead).
 */
export function DrawerTool({
  title,
  lead,
  width = "3xl",
  extras,
  children,
}: {
  title: string;
  lead?: ReactNode;
  width?: "2xl" | "3xl";
  extras: readonly ExtraId[];
  children: ReactNode;
}) {
  const { data: on } = useExtrasQuery({ select: extrasOn });
  return (
    <PillarLayout back={{ to: "/drawer", label: "The Drawer" }} title={title} lead={lead} width={width}>
      {extras.some((id) => on.has(id)) ? (
        children
      ) : (
        <p className="text-sm text-fg-normal">
          <ComesWith extras={extras} />
        </p>
      )}
    </PillarLayout>
  );
}
