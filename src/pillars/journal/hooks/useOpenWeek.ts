import { getRouteApi } from "@tanstack/react-router";
import type { Week } from "../../../lib/timeline";

const route = getRouteApi("/app/journal");

/** Opening a week from a zoomed-out view: the story in days, at that week (`?at=`). */
export function useOpenWeek() {
  const navigate = route.useNavigate();
  return (week: Week) => navigate({ search: { at: week } });
}
