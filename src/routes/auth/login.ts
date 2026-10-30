import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { accessQuery } from "../../api/rpc/session";
import { rootRoute } from "../root";
import { loginSearch } from "../search";

/** The household password, outside the frame: logging in with it, or choosing it on the first visit. */
export const login = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: loginSearch,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(accessQuery),
  component: lazyRouteComponent(() => import("../../features/auth/pages/LoginPage"), "LoginPage"),
});
