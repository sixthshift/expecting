import type { Summary } from "./summary";

/** A record as it's read out or pasted: its name, its answer, then each line. */
type Titled = { title: string; summary: Summary };

/**
 * The records as plain text, to paste into a message or a form: a heading
 * (when, and the week), then each with its answer and lines, and the
 * papers by name. What's said is what's on the page, nothing more.
 */
export function summariesText({ heading, summaries, papers }: { heading: string; summaries: readonly Titled[]; papers: readonly string[] }): string {
  const parts = [heading, ...summaries.map(({ title, summary }) => [`${title}: ${summary.headline}`, ...summary.lines.map((l) => `- ${l}`)].join("\n"))];
  if (papers.length > 0) parts.push(["Papers kept", ...papers.map((p) => `- ${p}`)].join("\n"));
  return parts.join("\n\n");
}
