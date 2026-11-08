// What the capture "+" offers, in a fixed order: rows that move are harder to
// hit with a thumb, so there's no "most used first" and no last pick
// remembered. Each files into its pillar: a movement, sickness, a craving, a
// note, a photo, a paper, a feeling and a first into the Journal, an
// appointment, a question and a task into the Planner.

/** One thing the "+" can file. */
export type Capture = "movement" | "sick" | "craving" | "note" | "photo" | "paper" | "feeling" | "first" | "appointment" | "question" | "task";

/**
 * Each choice: what it is, in a few words what it becomes (facts, not a
 * pitch), and the pillar it files into, with what its toast calls it ("Note
 * kept", In the Journal).
 */
export const CHOICE: Record<Capture, { label: string; becomes: string; pillar: "Journal" | "Planner"; kept: string }> = {
  movement: { label: "The baby moved", becomes: "So you know their rhythm", pillar: "Journal", kept: "Movement kept" },
  sick: { label: "Sick or queasy", becomes: "Since when, if you're asked", pillar: "Journal", kept: "Sickness kept" },
  craving: { label: "A craving", becomes: "Tallied, for later", pillar: "Journal", kept: "Craving kept" },
  note: { label: "A note", becomes: "On its day, for you both, or to the baby", pillar: "Journal", kept: "Note kept" },
  photo: { label: "A photo or scan", becomes: "The bump lined up week by week", pillar: "Journal", kept: "Photo kept" },
  paper: { label: "A result or paper", becomes: "Found in a moment", pillar: "Journal", kept: "Paper kept" },
  feeling: { label: "How I'm feeling", becomes: "The weeks, at a glance", pillar: "Journal", kept: "Feeling kept" },
  first: { label: "A first", becomes: "In both your words", pillar: "Journal", kept: "First kept" },
  appointment: { label: "An appointment", becomes: "On its week, with your questions", pillar: "Planner", kept: "Appointment added" },
  question: { label: "A question to ask", becomes: "Ready for the appointment", pillar: "Planner", kept: "Question added" },
  task: { label: "Something to do", becomes: "In the Planner", pillar: "Planner", kept: "Task added" },
};

/**
 * What a phone is offered. A feeling only when it's said who's holding it
 * (a feeling is someone's); a movement only once movements are offered
 * (`movementsOffered`, never while something has happened); sickness and
 * cravings at any week, but never while something has happened; a photo or
 * scan at any week, but never offered while something has happened (the
 * Journal keeps a way to add one, folded away); a result or paper and an
 * appointment always, as they are admin and there are more after a loss,
 * not fewer; a first
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
    ["appointment", true],
    ["question", true],
    ["task", !quiet],
  ];
  return all.filter(([, offered]) => offered).map(([c]) => c);
}

/**
 * What something shared into Expecting can become, of what's offered now, in
 * the same order. Pictures, a photo or a paper (a letter photographed is a
 * paper); anything else with them (a PDF), a paper; only words or a link, a
 * note, a question or a task. Its files' types as the phone gave them.
 */
export function sharedChoices({ types, text }: { types: readonly string[]; text: boolean }, offered: readonly Capture[]): Capture[] {
  const fits: Capture[] =
    types.length > 0 ? (types.every((type) => type.startsWith("image/")) ? ["photo", "paper"] : ["paper"]) : text ? ["note", "question", "task"] : [];
  return offered.filter((c) => fits.includes(c));
}
