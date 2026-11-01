import { bootstrapTheme } from "@sixthshift/design-system/hooks";
import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { paintFavicon, paintThemeColour } from "../../lib/theme";
import { registerWorker } from "../../pwa/register";

/**
 * Around every page, login and onboarding included: this phone's mode. The
 * boot script painted it before the first frame; here the design system takes
 * over, so "system" follows the phone when it changes and another tab's
 * choice applies. The phone's bar follows whatever the page is drawn in,
 * and the tab's icon the theme.
 * And the service worker, which keeps the app and its data for offline.
 */
export function Root() {
  useEffect(() => bootstrapTheme(), []);
  useEffect(() => registerWorker(), []);
  useEffect(() => {
    const paint = () => {
      paintThemeColour();
      paintFavicon();
    };
    paint();
    const watch = new MutationObserver(paint);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-expecting-theme"] });
    return () => watch.disconnect();
  }, []);
  return <Outlet />;
}
