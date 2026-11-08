import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { namesQuery } from "../../../../../api/rpc/names";
import { putAway } from "../../../../../app/features/quiet/putAway";
import { worlds } from "../../../../../app/features/quiet/worlds";
import { DECK_FILTERS } from "../../../../../lib/drawer/names";
import { TOOLS, toolPutAway } from "../../../model/tools";
import { drawer } from "../../../routes/drawer";

/** The names game's search: which names it deals (`girls`, `boys`, `all`); without, all of them. Only while you don't know which it is: knowing, the deck is that one's. */
const namesSearch = z.object({
  names: z.enum(DECK_FILTERS).optional().catch(undefined),
});

/** The names game, a page of its own from the Drawer, as this phone's person sees it. */
export const names = createRoute({
  getParentRoute: () => drawer,
  path: "names",
  validateSearch: namesSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(namesQuery),
  component: worlds(
    lazyRouteComponent(() => import("../pages/NamesPage"), "NamesPage"),
    putAway(toolPutAway(TOOLS.names))
  ),
});
