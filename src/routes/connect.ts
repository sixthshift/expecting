import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { connectRequestQuery } from "../api/rpc/connections";
import { peopleQuery } from "../api/rpc/people";
import { LoadingPage } from "../components/loading/Loading";
import { rootRoute } from "./root";
import { connectSearch } from "./search";

/** `/connect`: letting Claude (an MCP client) in, outside the frame. Behind the password like any page, so logging in comes first. */
export const connect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connect",
  validateSearch: connectSearch,
  loaderDeps: ({ search }) => ({ clientId: search.client_id ?? "", redirectUri: search.redirect_uri ?? "" }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([queryClient.ensureQueryData(peopleQuery), queryClient.ensureQueryData(connectRequestQuery(deps.clientId, deps.redirectUri))]),
  pendingComponent: LoadingPage,
  component: lazyRouteComponent(() => import("../features/connect/pages/ConnectPage"), "ConnectPage"),
});
