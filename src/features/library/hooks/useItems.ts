import { useMemo } from "react";
import { useExtrasQuery } from "../../../api/rpc/extras";
import { useAnswersQuery } from "../../../api/rpc/facts";
import type { Item } from "../../../content/schema";
import { tailorItems } from "../../../content/tailor";
import { extrasOn } from "../../../lib/extras";
import { factsOf } from "../../../lib/facts";

/** The items for you, tailored as your answers and extras change. */
export function useItems(): Item[] {
  const { data: facts } = useAnswersQuery({ select: factsOf });
  const { data: on } = useExtrasQuery({ select: extrasOn });
  return useMemo(() => tailorItems(facts, on), [facts, on]);
}
