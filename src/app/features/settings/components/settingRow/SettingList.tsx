import type { ReactNode } from "react";

/** Rows in one bordered list, divided. */
export function SettingList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal">{children}</div>;
}
