import { createContext, useContext } from "react";
import type { Week } from "../../../../lib/timeline";
import type { Facts } from "../../../settings/model/facts";

/** What content renders against: your answers, where you are now, the questions already on your list. */
export type ContentContextValue = { facts: Facts; now: Week | null; openQuestions: readonly string[] };

export const ContentContext = createContext<ContentContextValue>({ facts: {}, now: null, openQuestions: [] });

export function useContentContext(): ContentContextValue {
  return useContext(ContentContext);
}
