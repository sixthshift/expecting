import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import type { StoryItem } from "../../../lib/story/items";
import { lensesKept, type StoryLens } from "../../../lib/story/views";

const route = getRouteApi("/app/journal");

/** The lenses there's something in (while quiet, not the folded kinds), and the one open: `?show=`, or all when it has nothing. */
export function useLens(items: readonly StoryItem[], quiet: boolean): { lens: StoryLens; lenses: StoryLens[] } {
  const { show } = route.useSearch();
  const lenses = useMemo(() => lensesKept(items, quiet), [items, quiet]);
  return { lens: show && lenses.includes(show) ? show : "all", lenses };
}
