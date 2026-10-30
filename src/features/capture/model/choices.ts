// What the capture "+" offers, in a fixed order: rows that move are harder to
// hit with a thumb, so there's no "most used first" and no last pick
// remembered. Each files into its pillar: a movement, sickness, a craving, a
// note, a photo, a paper, a feeling and a first into the Journal, a question
// and a task into the Planner.

/** One thing the "+" can file. */
export type Capture = "movement" | "sick" | "craving" | "note" | "photo" | "paper" | "feeling" | "first" | "question" | "task";

/** Where each one goes, as its toast says and its link opens. */
export const FILED_IN: Record<Capture, { pillar: "Journal" | "Planner"; to: "/journal" | "/planner" }> = {
  movement: { pillar: "Journal", to: "/journal" },
  sick: { pillar: "Journal", to: "/journal" },
  craving: { pillar: "Journal", to: "/journal" },
  note: { pillar: "Journal", to: "/journal" },
  photo: { pillar: "Journal", to: "/journal" },
  paper: { pillar: "Journal", to: "/journal" },
  feeling: { pillar: "Journal", to: "/journal" },
  first: { pillar: "Journal", to: "/journal" },
  question: { pillar: "Planner", to: "/planner" },
  task: { pillar: "Planner", to: "/planner" },
};

/**
 * What a phone is offered. A feeling only when it's said who's holding it
 * (a feeling is someone's); a movement only once movements are offered
 * (`movementsOffered`, never while something has happened); sickness and
 * cravings at any week, but never while something has happened; a photo or
 * scan at any week, but never offered while something has happened (the
 * Journal keeps a way to add one, folded away); a result or paper always,
 * as papers are admin and there are more after a loss, not fewer; a first
 * never while something has happened; and nothing to do while something has
 * happened, as To do is put aside.
 */
export function captureChoices({ holding, quiet, movements }: { holding: boolean; quiet: boolean; movements: boolean }): Capture[] {
  const all: [Capture, boolean][] = [
    ["movement", movements && !quiet],
    ["sick", !quiet],
    ["craving", !quiet],
    ["note", true],
    ["photo", !quiet],
    ["paper", true],
    ["feeling", holding],
    ["first", !quiet],
    ["question", true],
    ["task", !quiet],
  ];
  return all.filter(([, offered]) => offered).map(([c]) => c);
}

/** The ones the Journal keeps: its Keep row. */
export function journalChoices(choices: readonly Capture[]): Capture[] {
  return choices.filter((c) => FILED_IN[c].pillar === "Journal");
}
