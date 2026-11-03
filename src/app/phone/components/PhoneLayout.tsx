import { cn } from "@sixthshift/design-system/utils";
import { Outlet } from "@tanstack/react-router";
import type { Pillar } from "../../components/layout/AppLayout";
import { PillarNav } from "../../components/layout/PillarNav";
import { CaptureButton } from "../../features/capture/components/CaptureButton";
import { SharedIn } from "../../features/capture/components/SharedIn";

/**
 * The app on a phone: the page, and a tab bar under the thumb, its height in
 * `--tab-bar` so what sits above it (the timeline's scrubber, the capture
 * "+") can. The "+" floats above the tab bar on the pillars only, with room
 * left under each page so it never covers the last row. It's time, the call
 * button, Emergency info and settings are in each pillar's top corner
 * (`PhoneCorner`).
 */
export function PhoneLayout({ tabs, onPillar }: { tabs: readonly Pillar[]; onPillar: boolean }) {
  return (
    <div className="[--tab-bar:calc(3.75rem+env(safe-area-inset-bottom))]">
      <div className={cn("min-w-0 pb-(--tab-bar)", onPillar && "pb-[calc(var(--tab-bar)+4.5rem)]")}>
        <Outlet />
      </div>

      {onPillar ? (
        <div className="print:hidden">
          <CaptureButton layout="float" />
        </div>
      ) : null}

      <SharedIn />

      <div className="frame-tab-bar fixed inset-x-0 bottom-0 z-30 print:hidden border-t border-border-subtle bg-bg-normal/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <PillarNav pillars={tabs} layout="tabs" />
      </div>
    </div>
  );
}
