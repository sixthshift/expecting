import { type Pillar, PillarLayout } from "../../features/app/PillarLayout";

/** The newborn's layout: its own place for what only this stage has around its pillars, like the night mode. */
export function PostpartumLayout({ pillars }: { pillars: readonly Pillar[] }) {
  return <PillarLayout pillars={pillars} />;
}
