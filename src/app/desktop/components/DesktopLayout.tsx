import { cn } from "@sixthshift/design-system/utils";
import { Outlet } from "@tanstack/react-router";
import type { Pillar } from "../../components/layout/AppLayout";
import { SharedIn } from "../../features/capture/components/SharedIn";
import { AddressedPanel } from "./panel/AddressedPanel";
import { PanelProvider, usePanel } from "./panel/panel";
import { TopBar } from "./TopBar";

/**
 * The app on a desktop: the top bar across it (`TopBar`: the pillars, the
 * week, search, the "+", the corner, you), the page under it, and on its
 * right the side panel while something is open in it (`SidePanel`), the
 * page giving it room rather than going under it. A pillar's own places are
 * its rail, down the page's left (`PillarLayout`). The bar's height is
 * `--top-bar`, so what sticks while the page scrolls sticks under it;
 * nothing sits under the page, so `--tab-bar` is nothing.
 */
export function DesktopLayout({ pillars, onPillar }: { pillars: readonly Pillar[]; onPillar: boolean }) {
  return (
    <PanelProvider>
      <div className="[--tab-bar:0px] [--top-bar:3.5rem] print:[--top-bar:0px]">
        <TopBar pillars={pillars} onPillar={onPillar} />
        <div className="flex items-start">
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
          <Slot />
        </div>
        <AddressedPanel />
        <SharedIn />
      </div>
    </PanelProvider>
  );
}

/** Where the side panel draws: always there, so what opens has somewhere to go; taking its room only while something's in it. */
function Slot() {
  const { setSlot, open } = usePanel();
  return (
    <div
      ref={setSlot}
      className={cn(
        "sticky top-(--top-bar) h-[calc(100dvh-var(--top-bar))] w-[min(28rem,40vw)] shrink-0 overflow-y-auto border-l border-border-subtle bg-bg-normal print:hidden",
        !open && "hidden"
      )}
    />
  );
}
