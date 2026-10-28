import { type Pillar, PillarLayout } from "../../app/PillarLayout";

/** The newborn's layout: its own place for what only this phase has around its pillars, like the night mode. */
export function PostpartumLayout({ pillars }: { pillars: readonly Pillar[] }) {
  return <PillarLayout pillars={pillars} />;
}
