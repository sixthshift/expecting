// What an item's body may contain beyond Markdown: Markdoc tags, each declared
// here with its attributes, and conditions on the household's answers. The
// body is parsed and checked once, as the content loads, so a mistyped tag, an
// unknown $question or an answer that doesn't exist fails the gate. Rendering
// is in src/components/content/, which maps each tag to a component.
//
//   {% if equals($cover, "yes") %} … {% else /%} … {% /if %}
//   {% ask "Is it too late after 36 weeks?" /%}      a question to add in one tap
//   {% window from=28 to=36 /%}                      the weeks it applies, against today

import Markdoc, { Ast, type Config, type Node, type Schema } from "@markdoc/markdoc";
import { PREGNANCY_WEEKS } from "../lib/timeline";
import { isAnswer, PROFILE, question } from "./profile";

const ask: Schema = {
  render: "Ask",
  selfClosing: true,
  attributes: { primary: { type: String, required: true } },
};

const window: Schema = {
  render: "Window",
  selfClosing: true,
  attributes: { from: { type: Number, required: true }, to: { type: Number, required: true } },
  validate(node) {
    const { from, to } = node.attributes as { from: number; to: number };
    const ok = Number.isInteger(from) && Number.isInteger(to) && PREGNANCY_WEEKS.first <= from && from <= to && to <= PREGNANCY_WEEKS.last;
    return ok
      ? []
      : [{ id: "window-weeks", level: "error", message: `window weeks must run forwards within ${PREGNANCY_WEEKS.first}–${PREGNANCY_WEEKS.last}` }];
  },
};

/** The schema both checking and rendering use. Variables are the household's answers, supplied at render. */
export const markdocConfig: Config = {
  tags: { ask, window },
  validation: { validateFunctions: true },
};

/** Every $question and every answer compared against it, wherever they sit in an attribute. */
function checkAnswers(value: unknown, problems: string[]) {
  if (Ast.isVariable(value)) {
    const [name] = value.path as string[];
    if (!question(String(name))) problems.push(`$${name} is not a question in profile.yaml (there are ${PROFILE.map((q) => `$${q.id}`).join(", ")})`);
    return;
  }
  if (Ast.isFunction(value)) {
    const params = Object.values(value.parameters);
    // equals($q, "answer"): the answer must be one of the question's.
    if (value.name === "equals") {
      const variable = params.find(Ast.isVariable);
      const name = variable ? String((variable.path as string[])[0]) : null;
      for (const p of params) {
        if (name && question(name) && typeof p === "string" && !isAnswer(name, p)) {
          problems.push(`"${p}" is not an answer to $${name} (answers: ${Object.keys(question(name)!.answers).join(", ")})`);
        }
      }
    }
    for (const p of params) checkAnswers(p, problems);
  }
}

/** Parse a body and check it. Returns the tree to render, or the problems found. */
export function parseBody(body: string): { ast: Node; problems: string[] } {
  const ast = Markdoc.parse(body);
  const problems = Markdoc.validate(ast, markdocConfig)
    .filter((e) => e.error.level === "error" || e.error.level === "critical")
    .map((e) => `line ${(e.lines[0] ?? 0) + 1}: ${e.error.message}`);
  for (const node of [ast, ...ast.walk()]) {
    for (const value of Object.values(node.attributes)) checkAnswers(value, problems);
  }
  return { ast, problems };
}
