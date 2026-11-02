import { createContext, useContext } from "react";
import type { Facts } from "../../../../app/features/settings/model/facts";
import type { Week } from "../../../../lib/timeline";

/** What content renders against: your answers, where you are now, the questions already on your list. */
export type ContentContextValue = { facts: Facts; now: Week | null; openQuestions: readonly string[] };

export const ContentContext = createContext<ContentContextValue>({ facts: {}, now: null, openQuestions: [] });

export function useContentContext(): ContentContextValue {
  return useContext(ContentContext);
}
