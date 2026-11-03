import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { namesQuery } from "../api/rpc/names";
import { putAway } from "../app/features/quiet/putAway";
import { worlds } from "../app/features/quiet/worlds";
import { app } from "./app";
import { namesSearch } from "./search";

/** The names game, a page of its own from the Drawer, as this phone's person sees it. */
export const drawerNames = createRoute({
  getParentRoute: () => app,
  path: "/drawer/names",
  validateSearch: namesSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(namesQuery),
  component: worlds(
    lazyRouteComponent(() => import("../pillars/drawer/features/names/pages/NamesPage"), "NamesPage"),
    putAway({ subject: "The names", are: true, back: { to: "/drawer", label: "The Drawer" }, title: "Baby names", width: "3xl" })
  ),
});
