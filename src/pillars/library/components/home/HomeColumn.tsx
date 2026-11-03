import type { ReactNode } from "react";

/** The Library's home below the search, as both worlds lay it out: its parts in one column. */
export function HomeColumn({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-10 desktop:gap-12">{children}</div>;
}
