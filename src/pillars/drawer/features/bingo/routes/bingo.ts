import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { bingoQuery } from "../../../../../api/rpc/bingo";
import { putAway } from "../../../../../app/features/quiet/putAway";
import { worlds } from "../../../../../app/features/quiet/worlds";
import { TOOLS, toolPutAway } from "../../../model/tools";
import { drawer } from "../../../routes/drawer";

/** Bingo's search: your card, or the other's. */
const bingoSearch = z.object({ card: z.enum(["theirs"]).optional().catch(undefined) });

/** Pregnancy bingo, a page of its own from the Drawer: your card, or the other's (`?card=theirs`). */
export const bingo = createRoute({
  getParentRoute: () => drawer,
  path: "bingo",
  validateSearch: bingoSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(bingoQuery),
  component: worlds(
    lazyRouteComponent(() => import("../pages/BingoPage"), "BingoPage"),
    putAway(toolPutAway(TOOLS.bingo))
  ),
});
