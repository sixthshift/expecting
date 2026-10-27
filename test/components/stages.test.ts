import { expect, test } from "vitest";
import type { Pillar } from "../../src/components/shell/Frame";
import { PAGES, type PillarKey } from "../../src/components/stages/pages";
import { PILLARS as postpartum } from "../../src/components/stages/postpartum/Shell";
import { PILLARS as preconception } from "../../src/components/stages/preconception/Shell";
import { PILLARS as pregnancy } from "../../src/components/stages/pregnancy/Shell";
import type { Stage } from "../../src/lib/stage";

const SHELLS: Record<Stage, readonly Pillar[]> = { preconception, pregnancy, postpartum };
const keyOf = (pillar: Pillar): PillarKey => (pillar.to === "/" ? "home" : (pillar.to.slice(1) as PillarKey));

test.each(Object.keys(SHELLS) as Stage[])("%s's navigation lists exactly the pillars it has pages for", (stage) => {
  const navigation = SHELLS[stage].map(keyOf).sort();
  const pages = (Object.keys(PAGES) as PillarKey[]).filter((key) => stage in PAGES[key]).sort();
  expect(navigation).toEqual(pages);
});

test("every stage has a home", () => {
  for (const stage of Object.keys(SHELLS) as Stage[]) expect(SHELLS[stage][0]?.to).toBe("/");
});
