import { Navigate } from "@tanstack/react-router";
import { type ComponentType, lazy, type ReactNode, Suspense } from "react";
import type { Phase } from "../../lib/timeline";
import { useApp } from "../household/useApp";
import type { Pillar } from "./PillarLayout";
import type { Phases } from "./phaseApp";

/**
 * The page at `to` in whichever of `phases` the household is in: one route, a
 * page per phase, loaded only when it's that phase's. A phase without the
 * pillar goes home.
 */
export function phasePage(phases: Phases, to: Pillar["to"]): () => ReactNode {
  const pages = {} as Partial<Record<Phase, ComponentType>>;
  for (const [phase, app] of Object.entries(phases) as [Phase, Phases[Phase]][]) {
    const pillar = app.pillars.find((p) => p.to === to);
    if (pillar) pages[phase] = lazy(() => pillar.page().then((page) => ({ default: page })));
  }

  return function PhasePage() {
    const Page = pages[useApp().phase];
    if (!Page) return <Navigate to="/" replace />;
    return (
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    );
  };
}
