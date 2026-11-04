import { Outlet } from "@tanstack/react-router";
import type { Pillar } from "../../components/layout/AppLayout";
import { SharedIn } from "../../features/capture/components/SharedIn";
import { TopBar } from "./TopBar";

/**
 * The app on a desktop: the top bar across it (`TopBar`: the pillars, the
 * week, search, the "+", the corner, you), the page under it with the whole
 * width. A pillar's own places are its rail, down the page's left
 * (`PillarLayout`). Its height is `--top-bar`, so what sticks while the page
 * scrolls sticks under it; nothing sits under the page, so `--tab-bar` is
 * nothing.
 */
export function DesktopLayout({ pillars, onPillar }: { pillars: readonly Pillar[]; onPillar: boolean }) {
  return (
    <div className="[--tab-bar:0px] [--top-bar:3.5rem] print:[--top-bar:0px]">
      <TopBar pillars={pillars} onPillar={onPillar} />
      <div className="min-w-0">
        <Outlet />
      </div>
      <SharedIn />
    </div>
  );
}
