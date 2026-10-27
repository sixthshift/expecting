// Which page each stage shows for each pillar: the one place that says which
// stages have which pillars. Each stage's Shell lists the same pillars for its
// navigation, and test/components/stages.test.ts holds the two to each other.
//
// A page that differs by stage lives under that stage; one that's the same in
// every stage stays in its route folder until it diverges.

import type { StagePages } from "./byStage";

export const PAGES = {
  home: {
    preconception: () => import("./preconception/Home").then((m) => m.PreconceptionHome),
    pregnancy: () => import("./pregnancy/Home").then((m) => m.PregnancyHome),
    postpartum: () => import("./postpartum/Home").then((m) => m.PostpartumHome),
  },
  library: {
    preconception: () => import("../../routes/library/page").then((m) => m.LibraryPage),
    pregnancy: () => import("../../routes/library/page").then((m) => m.LibraryPage),
    postpartum: () => import("../../routes/library/page").then((m) => m.LibraryPage),
  },
  planner: {
    preconception: () => import("../../routes/planner/page").then((m) => m.PlannerPage),
    pregnancy: () => import("../../routes/planner/page").then((m) => m.PlannerPage),
    postpartum: () => import("../../routes/planner/page").then((m) => m.PlannerPage),
  },
  journal: {
    pregnancy: () => import("./pregnancy/journal/Page").then((m) => m.PregnancyJournal),
    postpartum: () => import("./postpartum/journal/Page").then((m) => m.PostpartumJournal),
  },
  toolkit: {
    pregnancy: () => import("./pregnancy/toolkit/Page").then((m) => m.PregnancyToolkit),
    postpartum: () => import("./postpartum/toolkit/Page").then((m) => m.PostpartumToolkit),
  },
} satisfies Record<string, StagePages>;

export type PillarKey = keyof typeof PAGES;
