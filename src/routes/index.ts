import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { app } from "./app";
import { homeSearch } from "./search";

/** `/`: home, This week: where you are and what matters now, or a peek at another week (?at=). */
export const index = createRoute({
  getParentRoute: () => app,
  path: "/",
  validateSearch: homeSearch,
  component: lazyRouteComponent(() => import("../features/home/pages/Home"), "Home"),
});
