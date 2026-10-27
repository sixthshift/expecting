import { createContext, useContext } from "react";
import type { Profile } from "../../content/profile";
import type { Slot } from "../../lib/timeline";

/** What content renders against: the household's answers, where it is now, the questions already on its list. */
export type ContentContextValue = { profile: Profile; now: Slot | null; openQuestions: readonly string[] };

export const ContentContext = createContext<ContentContextValue>({ profile: {}, now: null, openQuestions: [] });

export function useContentContext(): ContentContextValue {
  return useContext(ContentContext);
}
