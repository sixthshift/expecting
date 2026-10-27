import type { ReactNode } from "react";
import type { HouseholdState } from "../household/load";

/** One screen of onboarding: its question, a line under it, and the way to answer. */
export type Screen = { title: string; lead?: ReactNode; body: ReactNode };

/** Save this step's answer (or nothing, to skip), reload what's known, and go on to the next. */
export type Advance = (save?: () => Promise<unknown>) => Promise<void>;

/** What every step is drawn from. */
export type StepContext = { state: HouseholdState; advance: Advance; finish: () => Promise<void> };
