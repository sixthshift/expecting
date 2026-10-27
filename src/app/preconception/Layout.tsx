import { type Pillar, PillarLayout } from "../../features/app/PillarLayout";

/** Getting ready's layout: its own place for what only this phase has around its pillars. */
export function PreconceptionLayout({ pillars }: { pillars: readonly Pillar[] }) {
  return <PillarLayout pillars={pillars} />;
}
