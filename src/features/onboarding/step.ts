import type { ReactNode } from "react";
import type { Settings } from "../../api/rpc/settings";
import type { Choice } from "../../lib/extras";
import type { Answer } from "../../lib/facts";
import type { Person } from "../../lib/people";

/** One screen of onboarding: its question, a line under it, and the way to answer. */
export type Screen = { title: string; lead?: ReactNode; body: ReactNode };

/** Save this step's answer (or nothing, to skip), reload what's known, and go on to the next. */
export type Advance = (save?: () => Promise<unknown>) => Promise<void>;

/** What every step is drawn from. */
export type StepContext = {
  settings: Settings;
  answers: Answer[];
  extras: Choice[];
  people: Person[];
  advance: Advance;
  finish: () => Promise<void>;
};
