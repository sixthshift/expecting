import { Navigate } from "@tanstack/react-router";
import { type ComponentType, lazy, type ReactNode, Suspense } from "react";
import type { Stage } from "../../lib/stage";
import { useApp } from "../app";

/** A pillar's page for each stage that has it, loaded only when that stage is the household's. */
export type StagePages = Partial<Record<Stage, () => Promise<ComponentType>>>;

/**
 * One route, a page per stage. The URL never says which stage this is; the
 * household does. A stage with no page here goes home.
 */
export function byStage(pages: StagePages): () => ReactNode {
  const loaded = Object.fromEntries(Object.entries(pages).map(([stage, load]) => [stage, lazy(() => load().then((page) => ({ default: page })))])) as Partial<
    Record<Stage, ComponentType>
  >;

  return function StagePage() {
    const Page = loaded[useApp().stage];
    if (!Page) return <Navigate to="/" replace />;
    return (
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    );
  };
}
