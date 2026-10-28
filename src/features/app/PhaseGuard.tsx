import { Outlet, useLocation } from "@tanstack/react-router";
import { samePageIn } from "../../lib/phase";
import type { Phase } from "../../lib/timeline";
import { useApp } from "../household/useApp";
import { Redirect } from "./Redirect";
import { usePhaseApp } from "./usePhaseApp";

/**
 * Around a phase's pages: the URL names the phase (`/pregnancy/planner`), but
 * the dates decide it. While they agree, the page; when they don't (a link
 * from before the birth, or the page open as the birth date is entered), the
 * same page in the household's phase, or its home.
 */
export function PhaseGuard({ phase }: { phase: Phase }) {
  const household = useApp().phase;
  const { pillars } = usePhaseApp();
  const { pathname } = useLocation();
  if (household === phase) return <Outlet />;
  return (
    <Redirect
      href={samePageIn(
        pathname,
        household,
        pillars.map((p) => p.to)
      )}
    />
  );
}

/** `/`: the household's phase's home, whichever that is. */
export function GoHome() {
  const { pillars } = usePhaseApp();
  return <Redirect href={pillars[0]!.to} />;
}
