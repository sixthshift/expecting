import type { ReactNode } from "react";

/** One part of the week in its column: dropped, gap and all, when the part draws nothing. */
export function Part({ children }: { children: ReactNode }) {
  return <div className="empty:hidden">{children}</div>;
}
