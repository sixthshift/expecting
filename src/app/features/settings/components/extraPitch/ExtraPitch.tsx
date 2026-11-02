import type { ReactNode } from "react";
import type { Extra } from "../../model/extras";

/**
 * An extra, wherever it's offered: its name (drawn by whoever offers it, as
 * a label, a heading or a button's text), its pitch, and what tool it brings
 * beyond its items. Inside a column.
 */
export function ExtraPitch({ extra, pitchClassName, children }: { extra: Extra; pitchClassName: string; children: ReactNode }) {
  return (
    <>
      {children}
      <span className={pitchClassName}>{extra.pitch}</span>
      {extra.tool ? <span className="text-xs font-medium text-fg-brand">And {extra.tool}</span> : null}
    </>
  );
}
