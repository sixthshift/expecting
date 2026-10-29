import { createContext, useContext } from "react";
import type { Week } from "../../../../lib/timeline";
import type { Facts } from "../../../settings/model/facts";

/** What content renders against: the household's answers, where it is now, the questions already on its list. */
export type ContentContextValue = { facts: Facts; now: Week | null; openQuestions: readonly string[] };

export const ContentContext = createContext<ContentContextValue>({ facts: {}, now: null, openQuestions: [] });

export function useContentContext(): ContentContextValue {
  return useContext(ContentContext);
}
