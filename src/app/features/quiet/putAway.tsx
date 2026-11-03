import { type RouteComponent, useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Back } from "../../components/layout/PillarLayout";
import { PutAwayPage } from "./pages/PutAwayPage";

/**
 * Where the page goes back to, as a route's file names it. Its `to` is a plain
 * string, not `Back`'s path: a route's options can't refer to the route
 * tree's paths while that tree is being typed.
 */
type BackTo = { to: string; label: string };

/**
 * A route's quiet world when its page is put away, for `worlds`: the page's
 * top as it is (the way `back`, or how the route's params give it; its
 * `title`, `lead` and `width`), and in place of the page what's put away
 * (`PutAwayPage`). Not lazy: it's small, and the same for every page put away.
 */
export function putAway({
  back,
  ...page
}: {
  subject: string;
  are?: boolean;
  aside?: boolean;
  back?: BackTo | ((params: Record<string, string>) => BackTo);
  title?: string;
  lead?: ReactNode;
  width?: "2xl" | "3xl" | "6xl";
}): RouteComponent {
  return function PutAway() {
    const params = useParams({ strict: false }) as Record<string, string>;
    const to = typeof back === "function" ? back(params) : back;
    return <PutAwayPage {...page} back={to as Back | undefined} />;
  };
}
