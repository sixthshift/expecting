// The questions that tailor the timeline, from content/profile.yaml, and the
// rules for what a household's answers do to an item. Pure, and bundled into
// the client like the items.

import { parse as parseYaml } from "yaml";
import { z } from "zod";
import source from "../../content/profile.yaml?raw";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "answers are lower-case words joined by hyphens");

const questionSchema = z
  .object({
    /** Also its name in content, as `$id`: so one word. */
    id: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, "a question id is one camelCase word, so content can write it as $id"),
    ask: z.string().min(1),
    answers: z.record(slug, z.string().min(1)).refine((a) => Object.keys(a).length >= 2, "a question needs at least two answers"),
  })
  .strict();

export type ProfileQuestion = z.output<typeof questionSchema>;

/** A household's answers: question id to answer id. A question not in it is unanswered. */
export type Profile = Record<string, string>;

/** content/profile.yaml into questions. Throws on a bad file or a repeated id. */
export function parseProfile(text: string): ProfileQuestion[] {
  const questions = z.array(questionSchema).parse(parseYaml(text));
  const ids = new Set<string>();
  for (const q of questions) {
    if (ids.has(q.id)) throw new Error(`profile.yaml: question "${q.id}" appears twice`);
    ids.add(q.id);
  }
  return questions;
}

export const PROFILE: readonly ProfileQuestion[] = parseProfile(source);

const byId = new Map(PROFILE.map((q) => [q.id, q]));

export function question(id: string): ProfileQuestion | undefined {
  return byId.get(id);
}

export function isAnswer(questionId: string, answer: string): boolean {
  return Object.hasOwn(byId.get(questionId)?.answers ?? {}, answer);
}

/** Answers still meaning something: drops any whose question or answer has since left profile.yaml. */
export function cleanProfile(profile: Profile): Profile {
  return Object.fromEntries(Object.entries(profile).filter(([q, a]) => isAnswer(q, a)));
}

/** An item's `when`: for each question, the answers it is for. */
export type When = Record<string, string[]>;

/**
 * Whether an item is for this household. Every condition must hold, and a
 * question not yet answered holds: tailoring only hides on a definite answer.
 */
export function applies(when: When, profile: Profile): boolean {
  return Object.entries(when).every(([q, answers]) => profile[q] === undefined || answers.includes(profile[q]));
}
