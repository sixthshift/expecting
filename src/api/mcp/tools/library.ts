// The Library's tools: finding an entry from a question asked in a sentence,
// and reading one whole. A private entry (family violence, reproductive
// coercion) is never among them.

import { z } from "zod";
import { builtInItems, loadPage } from "../../../content";
import { asText } from "../../../content/text";
import { rank } from "../../../lib/library/search";
import { answer, refuse, type Tools } from "../answer";
import { known } from "../context";
import { entryOf } from "../shapes";

export function libraryTools({ ctx, read }: Tools) {
  read(
    "search_library",
    {
      title: "Search the Library",
      description:
        "Search everything Expecting knows, best matches first: can-I questions (brie, hair dye, flying), symptoms (is this normal?), decisions, payments and entitlements, moments, guides, and the terms. Ask in words or a sentence. Read one with read_library.",
      inputSchema: { query: z.string().min(1).max(200), limit: z.number().int().min(1).max(50).default(10) },
    },
    ({ query, limit }) => {
      const k = known(ctx());
      return answer(
        rank(
          k.items.filter((i) => !i.private),
          query
        )
          .slice(0, limit)
          .map(entryOf)
      );
    }
  );

  read(
    "read_library",
    {
      title: "Read a Library entry",
      description:
        "One Library entry whole, as Markdown, its words fitted to your answers: what it says, its verdict or stakes, the questions it suggests for the next appointment, and its sources. Australian, from its sources; not medical advice.",
      inputSchema: { id: z.string().min(1).max(200) },
    },
    async ({ id }) => {
      const item = builtInItems.find((i) => i.id === id);
      if (!item || item.private) return refuse(`No entry ${id}: search_library finds them.`);
      const k = known(ctx());
      const page = await loadPage(item);
      return answer(
        [
          `# ${item.title}`,
          item.ask ? `*${item.ask}*` : null,
          item.verdict ? `Verdict: ${item.verdict}` : null,
          item.stakes ? `Stakes: ${item.stakes}` : null,
          item.from !== null ? `Weeks ${item.from}–${item.to}` : null,
          item.summary,
          asText(page.doc, k.facts),
          item.tasks.length
            ? `## Tasks\n\n${item.tasks.map((t) => `- ${t.title} (id ${t.id}; weeks ${t.opens}–${t.due}${t.deadline ? `, deadline week ${t.deadline}` : ""}${k.ticks[t.id] ? ", done" : ""})`).join("\n")}`
            : null,
          page.appointment.length ? `## To ask at the next appointment\n\n${page.appointment.map((q) => `- ${q}`).join("\n")}` : null,
          page.sources.length ? `## Sources\n\n${page.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}` : null,
        ]
          .filter(Boolean)
          .join("\n\n")
      );
    }
  );
}
