import type { ReactNode } from "react";
import { MobileCorner } from "./MobileCorner";

/**
 * The top of a pillar's page on a phone: one line that stays at the top as
 * the page scrolls, the page's heading (`children`, its `h1`) and the corner
 * beside it (`MobileCorner`); under them, a pillar's places as tabs
 * (`tabs`, `BarTabs`), where it has more than one. Under the phone's status
 * bar; the width of the screen, inside the page's column.
 */
export function MobileBar({ tabs, children }: { tabs?: ReactNode; children: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 flex flex-col border-b border-border-subtle bg-bg-normal/95 pt-[env(safe-area-inset-top)] pl-4 backdrop-blur print:static">
      <div className="flex min-h-14 items-center gap-2 pr-2">
        {children}
        <MobileCorner />
      </div>
      {tabs}
    </header>
  );
}
