import { createContext, useContext } from "react";
import type { PhaseApp } from "./phaseApp";

/** The household's phase's app, provided by App around every pillar. */
export const PhaseAppContext = createContext<PhaseApp | null>(null);

/**
 * What the current phase's app has, for shared pages: `usePhaseApp().timeline`
 * rather than asking which phase it is.
 */
export function usePhaseApp(): PhaseApp {
  const app = useContext(PhaseAppContext);
  if (!app) throw new Error("usePhaseApp outside App");
  return app;
}
