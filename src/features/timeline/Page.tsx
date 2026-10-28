import { getRouteApi } from "@tanstack/react-router";
import { Timeline } from "./Timeline";

const route = getRouteApi("/app/timeline");

/** The timeline, opened at this week or at ?at=. */
export function TimelinePage() {
  const { at } = route.useSearch();
  return <Timeline at={at} />;
}
