import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { peopleQuery } from "../../api/rpc/people";
import { LoadingPage } from "../../components/loading/Loading";
import { safeNext } from "../../lib/next";
import { rootRoute } from "../root";
import { loginSearch } from "../search";

/** `/password`: choosing your own, outside the frame, before going on (the frame sends you here). Nothing to choose, on you go. */
export const password = createRoute({
  getParentRoute: () => rootRoute,
  path: "/password",
  validateSearch: loginSearch,
  loaderDeps: ({ search }) => ({ next: search.next }),
  loader: async ({ context: { queryClient }, deps }) => {
    const people = await queryClient.ensureQueryData(peopleQuery);
    if (!people.mustChoosePassword) throw redirect({ href: safeNext(deps.next) });
  },
  pendingComponent: LoadingPage,
  component: lazyRouteComponent(() => import("../../app/features/auth/pages/PasswordPage"), "PasswordPage"),
});
