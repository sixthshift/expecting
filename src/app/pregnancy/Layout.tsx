import { type Pillar, PillarLayout } from "../../features/app/PillarLayout";

/** The pregnancy's layout: its own place for what only this phase has around its pillars, like go time from 37 weeks. */
export function PregnancyLayout({ pillars }: { pillars: readonly Pillar[] }) {
  return <PillarLayout pillars={pillars} />;
}
