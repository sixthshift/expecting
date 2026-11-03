import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { connectRequestQuery } from "../../../../api/rpc/connections";
import { peopleQuery } from "../../../../api/rpc/people";
import { LoadingPage } from "../../../../components/loading/Loading";
import { rootRoute } from "../../../../routes/root";

/** A value the router may have read as a number or a boolean (`?state=123`), back to the string it was sent as. */
const raw = z
  .union([z.string(), z.number().transform(String), z.boolean().transform(String)])
  .optional()
  .catch(undefined);

/** Connecting a client's search: an OAuth authorisation request, as sent. The page judges it (`authorisation`, src/lib/connect.ts). */
const connectSearch = z.object({
  response_type: raw,
  client_id: raw,
  redirect_uri: raw,
  code_challenge: raw,
  code_challenge_method: raw,
  state: raw,
  scope: raw,
  resource: raw,
});

/** `/connect`: letting Claude (an MCP client) in, outside the frame. Behind the password like any page, so logging in comes first. */
export const connect = createRoute({
  getParentRoute: () => rootRoute,
  path: "/connect",
  validateSearch: connectSearch,
  loaderDeps: ({ search }) => ({ clientId: search.client_id ?? "", redirectUri: search.redirect_uri ?? "" }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([queryClient.ensureQueryData(peopleQuery), queryClient.ensureQueryData(connectRequestQuery(deps.clientId, deps.redirectUri))]),
  pendingComponent: LoadingPage,
  component: lazyRouteComponent(() => import("../pages/ConnectPage"), "ConnectPage"),
});
