import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { codeQuery } from "../../api/rpc/session";
import { LoadingPage } from "../../components/loading/Loading";
import { rootRoute } from "../root";
import { codeSearch } from "../search";

/** `/reset?code=…`: a new password by the link the other made, outside the frame and open without a session. */
export const reset = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset",
  validateSearch: codeSearch,
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: ({ context: { queryClient }, deps }) => (deps.code ? queryClient.ensureQueryData(codeQuery("reset", deps.code)) : null),
  pendingComponent: LoadingPage,
  component: lazyRouteComponent(() => import("../../features/auth/pages/ResetPage"), "ResetPage"),
});
