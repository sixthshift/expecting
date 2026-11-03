import { getRouteApi } from "@tanstack/react-router";
import { useQuietQuery } from "../../../../../api/rpc/quiet";
import { Timeline } from "../components/timeline/Timeline";
import { QuietTimelinePage } from "../quiet/pages/QuietTimelinePage";

const route = getRouteApi("/app/timeline");

/** The timeline, opened at this week or at ?at=; paused while something has happened. */
export function TimelinePage() {
  const { at } = route.useSearch();
  const { data: quiet } = useQuietQuery();
  return quiet ? <QuietTimelinePage quiet={quiet} /> : <Timeline at={at} />;
}
