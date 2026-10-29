// A body cut at its `##` headings, so a page can draw each part its own way:
// a symptom's levels as triage, a decision's options. Deeper headings stay
// inside their section.

import { Ast, type Node } from "@markdoc/markdoc";

/** A part of a body: its `##` heading's words (null for what comes before the first), and its nodes as a document to render. */
export type Section = { title: string | null; doc: Node };

/** A heading's words, as plain text. */
function textOf(node: Node): string {
  return [...node.walk()]
    .filter((n) => n.type === "text")
    .map((n) => String(n.attributes.content ?? ""))
    .join("");
}

export function sectionsOf(doc: Node): Section[] {
  const sections: { title: string | null; nodes: Node[] }[] = [{ title: null, nodes: [] }];
  for (const node of doc.children) {
    if (node.type === "heading" && node.attributes.level === 2) sections.push({ title: textOf(node).trim(), nodes: [] });
    else sections.at(-1)!.nodes.push(node);
  }
  return sections.filter((s) => s.title !== null || s.nodes.length > 0).map((s) => ({ title: s.title, doc: new Ast.Node("document", {}, s.nodes) }));
}
