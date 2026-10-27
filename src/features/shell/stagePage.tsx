import { Navigate } from "@tanstack/react-router";
import { type ComponentType, lazy, type ReactNode, Suspense } from "react";
import type { Stage } from "../../lib/stage";
import { useApp } from "../household/useApp";
import type { Pillar } from "./Frame";
import type { Stages } from "./stageApp";

/**
 * The page at `to` in whichever of `stages` the household is in: one route, a
 * page per stage, loaded only when it's that stage's. A stage without the
 * pillar goes home.
 */
export function stagePage(stages: Stages, to: Pillar["to"]): () => ReactNode {
  const pages = {} as Partial<Record<Stage, ComponentType>>;
  for (const [stage, app] of Object.entries(stages) as [Stage, Stages[Stage]][]) {
    const pillar = app.pillars.find((p) => p.to === to);
    if (pillar) pages[stage] = lazy(() => pillar.page().then((page) => ({ default: page })));
  }

  return function StagePage() {
    const Page = pages[useApp().stage];
    if (!Page) return <Navigate to="/" replace />;
    return (
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    );
  };
}
