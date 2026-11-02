import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useExtrasQuery } from "../../../../api/rpc/extras";
import { useQuietQuery } from "../../../../api/rpc/quiet";
import { extrasOn } from "../../../../lib/extras";
import { PutAwayNotice } from "../../../quiet/components/PutAwayNotice";
import type { ExtraId } from "../../../settings/model/extras";
import { ComesWith } from "../ComesWith";

const WIDTH = { "2xl": "max-w-2xl", "3xl": "max-w-3xl" } as const;

/**
 * Every tool's page in the Drawer: the way back to the Drawer, the tool's
 * name, and the tool in one column. While something has happened it's put
 * away (`putAway` is what, as the sentence starts; `are` when it's plural);
 * while none of its `extras` is on, it says which it comes with. Only when
 * it's on are its `children` drawn.
 */
export function DrawerFrame({
  title,
  width = "3xl",
  putAway,
  extras,
  children,
}: {
  title: string;
  width?: keyof typeof WIDTH;
  putAway: { subject: string; are?: boolean };
  extras: readonly ExtraId[];
  children: ReactNode;
}) {
  const { data: on } = useExtrasQuery({ select: extrasOn });
  const { data: quiet } = useQuietQuery();
  return (
    <main className={cn("mx-auto w-full overflow-x-clip px-4 pb-16 md:px-8", WIDTH[width])}>
      <Link to="/drawer" className="mt-4 flex min-h-11 items-center gap-1 text-sm text-fg-subtle">
        <ChevronLeft aria-hidden size={16} /> The Drawer
      </Link>
      <h1 className="mb-2 font-display text-3xl font-semibold text-fg-strong">{title}</h1>
      {quiet ? (
        <PutAwayNotice subject={putAway.subject} are={putAway.are} />
      ) : !extras.some((id) => on.has(id)) ? (
        <p className="text-sm text-fg-normal">
          <ComesWith extras={extras} />
        </p>
      ) : (
        children
      )}
    </main>
  );
}
