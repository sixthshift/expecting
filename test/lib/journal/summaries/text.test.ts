import { expect, test } from "vitest";
import { summariesText } from "../../../../src/lib/journal/summaries/text";

test("as text, to paste: a heading, each record with its answer and lines, then the papers", () => {
  const text = summariesText({
    heading: "Records at week 30",
    summaries: [{ title: "Movements", summary: { headline: "4 of the last 14 days", lines: ["Last kept yesterday."], lately: true } }],
    papers: ["Birth plan"],
  });
  expect(text).toBe("Records at week 30\n\nMovements: 4 of the last 14 days\n- Last kept yesterday.\n\nPapers kept\n- Birth plan");
});
