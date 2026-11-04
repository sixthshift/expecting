import { useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { DesktopLayout } from "../../desktop/components/DesktopLayout";
import { useLayout } from "../../hooks/useLayout";
import { useShortcuts } from "../../hooks/useShortcuts";
import { MobileLayout } from "../../mobile/components/MobileLayout";
import type { AppPath } from "../../model/paths";

/** One pillar in the navigation: where it lives (`/planner`) and what it's called. */
export type Pillar = { to: AppPath; label: string; icon: LucideIcon };

/**
 * The app's layout, what every pillar is drawn in: `DesktopLayout` (the top
 * bar) or `MobileLayout` (the tab bar), whichever this screen gets
 * (`useLayout`), each with the pillars as a row in their one order (`PILLARS`).
 * The capture "+" is on the pillars only, not on settings or Emergency info.
 */
export function AppLayout({ pillars }: { pillars: readonly Pillar[] }) {
  const { pathname } = useLocation();
  useShortcuts();
  const onPillar = pillars.some(({ to }) => pathname === to || (to !== "/" && pathname.startsWith(`${to}/`)));
  return useLayout() === "desktop" ? <DesktopLayout pillars={pillars} onPillar={onPillar} /> : <MobileLayout pillars={pillars} onPillar={onPillar} />;
}
