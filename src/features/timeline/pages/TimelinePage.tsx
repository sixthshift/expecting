import { getRouteApi } from "@tanstack/react-router";
import { useQuiet } from "../../../api/rpc/quiet";
import { useSettings } from "../../../api/rpc/settings";
import { pausedAt } from "../../../lib/quiet";
import { Paused } from "../components/paused/Paused";
import { Timeline } from "../components/timeline/Timeline";

const route = getRouteApi("/app/timeline");

/** The timeline, opened at this week or at ?at=; paused while something has happened. */
export function TimelinePage() {
  const { at } = route.useSearch();
  const { data: quiet } = useQuiet();
  const { data: settings } = useSettings();
  if (quiet) return <Paused week={pausedAt(quiet, settings.dueDate)} />;
  return <Timeline at={at} />;
}
