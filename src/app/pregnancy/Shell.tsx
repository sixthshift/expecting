import { Frame, type Pillar } from "../../features/shell/Frame";

/** The pregnancy's frame: its own place for what only this stage has around its pillars, like go time from 37 weeks. */
export function PregnancyShell({ pillars }: { pillars: readonly Pillar[] }) {
  return <Frame pillars={pillars} />;
}
