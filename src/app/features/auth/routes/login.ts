import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { accessQuery } from "../../../../api/rpc/session";
import { LoadingPage } from "../../../../components/loading/Loading";
import { safeNext } from "../../../../lib/next";
import { rootRoute } from "../../../../routes/root";

/** Login's search: where to go once in. */
export const loginSearch = z.object({ next: z.string().optional() });

/** Logging in as one of you, outside the frame, or setting Expecting up on a new instance. Already in, on to where you were going. */
export const login = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  validateSearch: loginSearch,
  loaderDeps: ({ search }) => ({ next: search.next }),
  loader: async ({ context: { queryClient }, deps }) => {
    const access = await queryClient.fetchQuery(accessQuery);
    if (access.me) throw redirect({ href: safeNext(deps.next) });
  },
  pendingComponent: LoadingPage,
  component: lazyRouteComponent(() => import("../pages/LoginPage"), "LoginPage"),
});
