import type { ReactNode } from "react";

/** A row of chips that narrow a shelf: one line that scrolls sideways on a phone, wrapping on a desktop. */
export function Chips({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav aria-label={label} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
      {children}
    </nav>
  );
}
