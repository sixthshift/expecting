import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { accessQuery, codeQuery } from "../../api/rpc/session";
import { LoadingPage } from "../../components/loading/Loading";
import { rootRoute } from "../root";
import { codeSearch } from "../search";

/** `/join?code=…`: joining by an invite, outside the frame and open without a session. */
export const join = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join",
  validateSearch: codeSearch,
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([queryClient.ensureQueryData(accessQuery), deps.code ? queryClient.ensureQueryData(codeQuery("join", deps.code)) : null]),
  pendingComponent: LoadingPage,
  component: lazyRouteComponent(() => import("../../app/features/auth/pages/JoinPage"), "JoinPage"),
});
