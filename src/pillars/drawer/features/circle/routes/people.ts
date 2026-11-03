import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { circleQuery } from "../../../../../api/rpc/circle";
import { putAway } from "../../../../../app/features/quiet/putAway";
import { worlds } from "../../../../../app/features/quiet/worlds";
import { VIEW_KEYS, type View } from "../../../../../lib/drawer/circle";
import { drawer } from "../../../routes/drawer";

/** Your people's search: which view (`visitors`, `hearing`, `help`, `gifts`); without, the first that's on. */
const peopleSearch = z.object({
  view: z
    .enum(VIEW_KEYS as [View, ...View[]])
    .optional()
    .catch(undefined),
});

/** Your people, a page of its own from the Drawer, at one of its views. */
export const people = createRoute({
  getParentRoute: () => drawer,
  path: "people",
  validateSearch: peopleSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(circleQuery),
  component: worlds(
    lazyRouteComponent(() => import("../pages/CirclePage"), "CirclePage"),
    putAway({
      subject: "Your people",
      are: true,
      back: { to: "/drawer", label: "The Drawer" },
      title: "Your people",
      lead: "The people around you two, and what each of them is doing. Only you two see it.",
      width: "3xl",
    })
  ),
});
