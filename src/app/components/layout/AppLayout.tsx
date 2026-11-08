import { useLocation } from "@tanstack/react-router";
import { DesktopLayout } from "../../desktop/components/DesktopLayout";
import { useLayout } from "../../hooks/useLayout";
import { useShortcuts } from "../../hooks/useShortcuts";
import { MobileLayout } from "../../mobile/components/MobileLayout";
import { PILLARS } from "./pillars";

/**
 * The app's layout, what every pillar is drawn in: `DesktopLayout` (the top
 * bar) or `MobileLayout` (the tab bar), whichever this screen gets
 * (`useLayout`), each with the pillars as a row in their one order (`PILLARS`).
 * The capture "+" is on the pillars only, not on settings or Emergency info.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  useShortcuts();
  const onPillar = PILLARS.some(({ to }) => pathname === to || (to !== "/" && pathname.startsWith(`${to}/`)));
  return useLayout() === "desktop" ? <DesktopLayout onPillar={onPillar} /> : <MobileLayout onPillar={onPillar} />;
}
