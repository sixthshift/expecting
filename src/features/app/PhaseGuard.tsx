import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { samePageIn } from "../../lib/phase";
import type { Phase } from "../../lib/timeline";
import { useApp } from "../household/useApp";
import type { AppPath } from "./paths";
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
      to={
        samePageIn(
          pathname,
          household,
          pillars.map((p) => p.to)
        ) as AppPath
      }
    />
  );
}

/** `/`: the household's phase's home, whichever that is. */
export function GoHome() {
  const { pillars } = usePhaseApp();
  return <Redirect to={pillars[0]!.to} />;
}

/**
 * Go to `to`, once. Not the router's <Navigate>: it navigates again whenever
 * it re-renders with new props, and this re-renders while that navigation is
 * pending (the location and the household change under it), which loops.
 * Keyed on the path, this goes once per place to go.
 */
function Redirect({ to }: { to: AppPath }) {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to, replace: true });
  }, [navigate, to]);
  return null;
}
