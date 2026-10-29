import { useMemo } from "react";
import { useExtras } from "../../api/rpc/extras";
import { useAnswers } from "../../api/rpc/facts";
import { builtInItems } from "../../content";
import type { Item } from "../../content/schema";
import { extrasOn, inExtras } from "../../lib/extras";
import { factsOf } from "../../lib/facts";
import type { Facts } from "../settings/model/facts";
import { applies } from "../settings/model/facts";

/** The items for this household: only those its facts fit, and in an extra only once that's on. */
export function tailorItems(facts: Facts, on: ReadonlySet<string>): Item[] {
  return builtInItems.filter((i) => applies(i.when, facts) && inExtras(i.extra, on));
}

/** The items for this household, tailored as its answers and extras change. */
export function useItems(): Item[] {
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: on } = useExtras({ select: extrasOn });
  return useMemo(() => tailorItems(facts, on), [facts, on]);
}
