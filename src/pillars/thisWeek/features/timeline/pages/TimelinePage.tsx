import { getRouteApi } from "@tanstack/react-router";
import { Timeline } from "../components/timeline/Timeline";

const route = getRouteApi("/app/timeline");

/** The timeline, opened at this week or at ?at=. While something has happened, the route draws `QuietTimelinePage` instead (`worlds`). */
export function TimelinePage() {
  const { at } = route.useSearch();
  return <Timeline at={at} />;
}
