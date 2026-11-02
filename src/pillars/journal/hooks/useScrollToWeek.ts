import { getRouteApi } from "@tanstack/react-router";
import { useEffect } from "react";

const route = getRouteApi("/app/journal");

/** `?at=28`: the story scrolled to that week (`#week-28`), as the timeline's weeks open it. Only in days: zoomed out, the week is a tile. */
export function useScrollToWeek() {
  const { at, view } = route.useSearch();
  useEffect(() => {
    if (at !== undefined && !view) document.getElementById(`week-${at}`)?.scrollIntoView({ block: "start" });
  }, [at, view]);
}
