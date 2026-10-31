import { getRouteApi } from "@tanstack/react-router";
import { useQuiet } from "../../../api/rpc/quiet";
import { type Lens, lensesKept } from "../../../lib/story";
import { useStory } from "./useStory";

const route = getRouteApi("/app/journal");

/** The lenses there's something in, and the one open (`?show=`, or all when it has nothing). */
export function useLens(): { lens: Lens; lenses: Lens[] } {
  const items = useStory();
  const { show } = route.useSearch();
  const { data: quiet } = useQuiet();
  const lenses = lensesKept(items, Boolean(quiet));
  return { lens: show && lenses.includes(show) ? show : "all", lenses };
}
