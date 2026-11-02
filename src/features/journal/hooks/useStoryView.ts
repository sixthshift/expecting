import { getRouteApi } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { useSettingsQuery } from "../../../api/rpc/settings";
import type { StoryItem } from "../../../lib/story/items";
import { type StoryView, viewsKept } from "../../../lib/story/views";

const route = getRouteApi("/app/journal");

/**
 * The way the story is looked at: `?view=` when there's something for it,
 * else days; the views there's something for; and opening one (days has no
 * `?view=`). `quiet`: while something has happened, the folded kinds aren't
 * views.
 */
export function useStoryView(items: readonly StoryItem[], { quiet }: { quiet: boolean }) {
  const { view: asked } = route.useSearch();
  const navigate = route.useNavigate();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const views = useMemo(() => viewsKept(items, { quiet, zoomable: dueDate !== null }), [items, quiet, dueDate]);
  const view: StoryView = asked && views.includes(asked) ? asked : "days";
  const open = useCallback((next: StoryView) => navigate({ search: { view: next === "days" ? undefined : next } }), [navigate]);
  return { view, views, open };
}
