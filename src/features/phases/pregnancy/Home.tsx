import { getRouteApi } from "@tanstack/react-router";
import { Timeline } from "./timeline/Timeline";

const route = getRouteApi("/app/");

/** The pregnancy's home: the timeline, opened at this week or at ?at=. */
export function PregnancyHome() {
  const { at } = route.useSearch();
  return <Timeline at={at} />;
}
