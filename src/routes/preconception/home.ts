import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { preconception } from ".";

/** Getting ready's home: what's best done before, and "we're expecting". */
export const preconceptionHome = createRoute({
  getParentRoute: () => preconception,
  path: "/",
  component: lazyRouteComponent(() => import("../../features/phases/preconception/Home"), "PreconceptionHome"),
});
