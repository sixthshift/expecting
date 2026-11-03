import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { accessQuery, codeQuery } from "../../../../api/rpc/session";
import { LoadingPage } from "../../../../components/loading/Loading";
import { rootRoute } from "../../../../routes/root";

/** /join and /reset: the code from the link, or none, to type it. */
export const codeSearch = z.object({ code: z.string().max(40).optional() });

/** `/join?code=…`: joining by an invite, outside the frame and open without a session. */
export const join = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join",
  validateSearch: codeSearch,
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([queryClient.ensureQueryData(accessQuery), deps.code ? queryClient.ensureQueryData(codeQuery("join", deps.code)) : null]),
  pendingComponent: LoadingPage,
  component: lazyRouteComponent(() => import("../pages/JoinPage"), "JoinPage"),
});
