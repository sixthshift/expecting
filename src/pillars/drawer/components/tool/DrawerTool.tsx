import type { ReactNode } from "react";
import { useExtrasQuery } from "../../../../api/rpc/extras";
import { PillarLayout } from "../../../../app/components/layout/PillarLayout";
import type { ExtraId } from "../../../../app/features/settings/model/extras";
import { extrasOn } from "../../../../lib/extras";
import { ComesWith } from "../ComesWith";

/**
 * Every tool's page in the Drawer: a page of the pillar with the way back to
 * the Drawer and the tool's name. While something has happened it's put away
 * (`putAway` is what, as the sentence starts; `are` when it's plural); while
 * none of its `extras` is on, it says which it comes with. Only when it's on
 * are its `children` drawn.
 */
export function DrawerTool({
  title,
  width = "3xl",
  putAway,
  extras,
  children,
}: {
  title: string;
  width?: "2xl" | "3xl";
  putAway: { subject: string; are?: boolean };
  extras: readonly ExtraId[];
  children: ReactNode;
}) {
  const { data: on } = useExtrasQuery({ select: extrasOn });
  return (
    <PillarLayout back={{ to: "/drawer", label: "The Drawer" }} title={title} width={width} putAway={putAway}>
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
