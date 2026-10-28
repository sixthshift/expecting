import type { Phase } from "../../lib/timeline";
import { useApp } from "../household/useApp";

/** The pages every phase has, by their path within it. */
type SharedPath = "/" | "/library" | "/library/$itemId" | "/planner";

/** A shared page's path in some phase: `/pregnancy/library/$itemId`, or the phase's home for `/`. */
export type PhasePath<P extends SharedPath> = P extends "/" ? `/${Phase}` : `/${Phase}${P}`;

/**
 * Links to a shared page in the household's phase: `to("/library/$itemId")`
 * is `/pregnancy/library/$itemId` while expecting. Shared code links through
 * this, so it never asks which phase it is.
 */
export function usePhaseTo() {
  const { phase } = useApp();
  return <P extends SharedPath>(path: P) => (path === "/" ? `/${phase}` : `/${phase}${path}`) as PhasePath<P>;
}
