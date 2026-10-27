import { Frame, type Pillar } from "../Frame";

/** The newborn's frame: its own place for what only this stage has around its pillars, like the night mode. */
export function PostpartumShell({ pillars }: { pillars: readonly Pillar[] }) {
  return <Frame pillars={pillars} />;
}
