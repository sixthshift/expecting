// What the capture "+" offers, in a fixed order: rows that move are harder to
// hit with a thumb, so there's no "most used first" and no last pick
// remembered. Each files into its pillar: a movement and a note into the
// Journal, a feeling into the Journal, a question and a task into the Planner.

/** One thing the "+" can file. */
export type Capture = "movement" | "note" | "feeling" | "question" | "task";

/** Where each one goes, as its toast says and its link opens. */
export const FILED_IN: Record<Capture, { pillar: "Journal" | "Planner"; to: "/journal" | "/planner" }> = {
  movement: { pillar: "Journal", to: "/journal" },
  note: { pillar: "Journal", to: "/journal" },
  feeling: { pillar: "Journal", to: "/journal" },
  question: { pillar: "Planner", to: "/planner" },
  task: { pillar: "Planner", to: "/planner" },
};

/**
 * What a phone is offered. A feeling only when it's said who's holding it
 * (a feeling is someone's); a movement only once movements are offered
 * (`movementsOffered`, never while something has happened); and nothing to
 * do while something has happened, as To do is put aside.
 */
export function captureChoices({ holding, quiet, movements }: { holding: boolean; quiet: boolean; movements: boolean }): Capture[] {
  const all: [Capture, boolean][] = [
    ["movement", movements && !quiet],
    ["note", true],
    ["feeling", holding],
    ["question", true],
    ["task", !quiet],
  ];
  return all.filter(([, offered]) => offered).map(([c]) => c);
}
