import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { rootRoute } from "./root";
import { loginSearch } from "./search";

/** The household password, outside the frame. */
export const login = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: loginSearch,
  component: lazyRouteComponent(() => import("../features/auth/LoginPage"), "LoginPage"),
});
