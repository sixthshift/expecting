import { useMemo } from "react";
import { useExtras } from "../../../api/rpc/extras";
import { useAnswers } from "../../../api/rpc/facts";
import type { Item } from "../../../content/schema";
import { tailorItems } from "../../../content/tailor";
import { extrasOn } from "../../../lib/extras";
import { factsOf } from "../../../lib/facts";

/** The items for you, tailored as your answers and extras change. */
export function useItems(): Item[] {
  const { data: facts } = useAnswers({ select: factsOf });
  const { data: on } = useExtras({ select: extrasOn });
  return useMemo(() => tailorItems(facts, on), [facts, on]);
}
