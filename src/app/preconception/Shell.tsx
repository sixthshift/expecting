import { Frame, type Pillar } from "../../features/shell/Frame";

/** Getting ready's frame: its own place for what only this stage has around its pillars. */
export function PreconceptionShell({ pillars }: { pillars: readonly Pillar[] }) {
  return <Frame pillars={pillars} />;
}
