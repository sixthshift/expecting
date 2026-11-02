import { cn } from "@sixthshift/design-system/utils";
import type { ReactNode } from "react";

/** Rows in one bordered list, divided. */
export function SettingList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-bg-normal", className)}>{children}</div>;
}
