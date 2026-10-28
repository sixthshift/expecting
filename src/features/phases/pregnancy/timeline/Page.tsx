import { getRouteApi } from "@tanstack/react-router";
import { Timeline } from "./Timeline";

const route = getRouteApi("/app/pregnancy/timeline");

/** The pregnancy's timeline, opened at this week or at ?at=. */
export function PregnancyTimeline() {
  const { at } = route.useSearch();
  return <Timeline at={at} />;
}
