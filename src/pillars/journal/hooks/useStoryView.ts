import { getRouteApi } from "@tanstack/react-router";
import { useCallback } from "react";
import { useSettingsQuery } from "../../../api/rpc/settings";
import { type StoryView, viewsOffered } from "../../../lib/story/views";

const route = getRouteApi("/app/journal");

/** The way the story is looked at: `?view=` when it's offered, else days; the views offered; and opening one (days has no `?view=`). */
export function useStoryView() {
  const { view: asked } = route.useSearch();
  const navigate = route.useNavigate();
  const { data: zoomable } = useSettingsQuery({ select: (s) => s.dueDate !== null });
  const views = viewsOffered(zoomable);
  const view: StoryView = asked && views.includes(asked) ? asked : "days";
  // Where you are on the page stays: the router otherwise scrolls to the top on every navigation, a new view included.
  const open = useCallback((next: StoryView) => navigate({ search: { view: next === "days" ? undefined : next }, resetScroll: false }), [navigate]);
  return { view, views, open };
}
