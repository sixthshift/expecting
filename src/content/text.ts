// A Markdoc body as plain Markdown, resolved against your answers as the app
// renders it: for a reader that isn't a screen (Claude, over MCP). The tags
// become words: a question to ask (`{% ask %}`) and the weeks something
// applies (`{% window %}`).

import Markdoc, { type Node, type RenderableTreeNode, Tag } from "@markdoc/markdoc";
import { type Facts, variables } from "../features/settings/model/facts";
import { markdocConfig } from "./markdoc";

function inline(nodes: readonly RenderableTreeNode[]): string {
  return nodes.map(toText).join("");
}

function toText(node: RenderableTreeNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return inline(node);
  if (!Tag.isTag(node)) return "";
  const children = inline(node.children);
  switch (node.name) {
    case "Ask":
      return `\n\n> A question to ask: "${node.attributes.primary}"\n\n`;
    case "Window":
      return `\n\n(Weeks ${node.attributes.from}–${node.attributes.to})\n\n`;
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      return `\n\n${"#".repeat(Number(node.name[1]))} ${children.trim()}\n\n`;
    case "p":
      return `\n\n${children.trim()}\n\n`;
    case "li":
      return `\n- ${children.trim()}`;
    case "ul":
    case "ol":
      return `\n${children}\n`;
    case "strong":
      return `**${children}**`;
    case "em":
      return `*${children}*`;
    case "a":
      return `[${children}](${node.attributes.href})`;
    case "blockquote":
      return `\n\n${children
        .trim()
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n")}\n\n`;
    case "hr":
      return "\n\n---\n\n";
    default:
      return children;
  }
}

/** `doc` as Markdown, its conditions decided by `facts`. */
export function asText(doc: Node, facts: Facts): string {
  const tree = Markdoc.transform(doc, { ...markdocConfig, variables: variables(facts) });
  return toText(tree)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
