import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { namesQuery } from "../api/rpc/names";
import { app } from "./app";
import { namesSearch } from "./search";

/** The names game, a page of its own from the Drawer, as this phone's person sees it. */
export const drawerNames = createRoute({
  getParentRoute: () => app,
  path: "/drawer/names",
  validateSearch: namesSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(namesQuery),
  component: lazyRouteComponent(() => import("../features/names/pages/NamesPage"), "NamesPage"),
});
