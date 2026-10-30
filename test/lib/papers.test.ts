import { describe, expect, test } from "vitest";
import { builtInItems } from "../../src/content";
import {
  handyByDefault,
  kindsKept,
  offlineFiles,
  ordered,
  PAPER_KINDS,
  PAPER_TOPICS,
  type Paper,
  paperMatches,
  paperProblem,
  paperWeek,
  topicsFor,
  weekPapers,
  weekPaperWords,
} from "../../src/lib/papers";

const DUE = "2027-01-19";
const pdf = (fileId: string) => ({ fileId, type: "application/pdf" as const, name: `${fileId}.pdf`, size: 1000 });
const jpeg = (fileId: string) => ({ fileId, type: "image/jpeg" as const, name: `${fileId}.jpg`, size: 1000 });

const paper = (id: string, fields: Partial<Paper> = {}): Paper => ({
  id,
  kind: "result",
  title: id,
  itemId: null,
  // Week 28, by DUE.
  day: "2026-10-28",
  note: null,
  handy: false,
  pages: [pdf(`file-${id}`)],
  by: null,
  createdAt: "2026-10-30T00:00:00.000Z",
  editedBy: null,
  editedAt: null,
  ...fields,
});

const span = (id: string) => {
  const item = builtInItems.find((i) => i.id === id);
  return item && item.from !== null ? { from: item.from, to: item.to } : null;
};

describe("what a paper can be about", () => {
  test("every topic is a Library entry, never a private one, and of a kind that has topics", () => {
    for (const topic of PAPER_TOPICS) {
      const item = builtInItems.find((i) => i.id === topic.id);
      expect(item, topic.id).toBeTruthy();
      expect(item?.private, topic.id).toBeFalsy();
    }
    expect(new Set(PAPER_TOPICS.map((t) => t.id)).size).toBe(PAPER_TOPICS.length);
  });

  test("a result's, the ones around its week first; after a loss nothing, as the list is the birth plan and the morphology scan", () => {
    const at26 = topicsFor("result", { week: 26, quiet: null, span });
    expect(at26.every((t) => t.kind === "result")).toBe(true);
    expect(at26.slice(0, 3).map((t) => t.id)).toContain("glucose-tolerance-test");
    expect(topicsFor("result", { week: 8, quiet: null, span })[0]!.id).toBe("first-blood-tests");
    expect(topicsFor("plan", { week: null, quiet: "news", span }).map((t) => t.id)).toEqual(["birth-preferences", "feeding-plan"]);
    expect(topicsFor("result", { week: 26, quiet: "loss", span })).toEqual([]);
    expect(topicsFor("other", { week: 26, quiet: null, span })).toEqual([]);
  });

  test("handy by default: a plan, or one asked for at the desk; never after a loss", () => {
    expect(handyByDefault("plan", null, null)).toBe(true);
    expect(handyByDefault("result", "blood-group-and-antibodies", null)).toBe(true);
    expect(handyByDefault("record", "going-home", "news")).toBe(true);
    expect(handyByDefault("result", "glucose-tolerance-test", null)).toBe(false);
    expect(handyByDefault(null, null, null)).toBe(false);
    expect(handyByDefault("plan", "birth-preferences", "loss")).toBe(false);
  });
});

describe("finding one", () => {
  test("handy first, then newest by the date on it", () => {
    const papers = [paper("old", { day: "2026-08-01" }), paper("new", { day: "2026-10-28" }), paper("plan", { day: "2026-07-01", handy: true })];
    expect(ordered(papers).map((p) => p.id)).toEqual(["plan", "new", "old"]);
  });

  test("by its name, kind, what it's about and its words, never anything it says", () => {
    const gtt = paper("a", { title: "Pathology", itemId: "glucose-tolerance-test", note: "Copy to the GP" });
    expect(paperMatches(gtt, "glucose")).toBe(true);
    expect(paperMatches(gtt, "result gp")).toBe(true);
    expect(paperMatches(gtt, "PATHOLOGY")).toBe(true);
    expect(paperMatches(gtt, "referral")).toBe(false);
    expect(paperMatches(gtt, "")).toBe(true);
  });

  test("the kinds there are, in their usual order", () => {
    expect(kindsKept([paper("a", { kind: "plan" }), paper("b"), paper("c", { kind: "plan" })])).toEqual(["result", "plan"]);
    expect(PAPER_KINDS).toEqual(["result", "letter", "plan", "record", "other"]);
  });
});

describe("the timeline", () => {
  test("a week's papers by kind, in words, without their names", () => {
    const papers = [paper("a"), paper("b"), paper("c", { kind: "letter" }), paper("d", { kind: "other" }), paper("e", { day: "2026-09-02" })];
    expect(paperWeek("2026-10-28", DUE)).toBe(28);
    expect(paperWeek("2026-10-26", DUE)).toBe(27);
    expect(paperWeek("2026-10-28", null)).toBeNull();
    expect(weekPaperWords(weekPapers(papers, 28, DUE))).toEqual(["2 results", "letter", "paper"]);
    expect(weekPaperWords(weekPapers(papers, 20, DUE))).toEqual(["result"]);
    expect(weekPaperWords(weekPapers(papers, 28, null))).toEqual([]);
  });
});

describe("offline", () => {
  test("a handy paper's pages are kept on each phone, PDF and all; a PDF no longer handy is let go", () => {
    const papers = [
      paper("plan", { handy: true, pages: [pdf("p1")] }),
      paper("letter", { handy: true, pages: [jpeg("j1"), jpeg("j2")] }),
      paper("gtt", { pages: [pdf("p2")] }),
      paper("photo", { pages: [jpeg("j3")] }),
    ];
    expect(offlineFiles(papers)).toEqual({
      keep: ["/api/files/p1/original", "/api/files/j1/display", "/api/files/j1/thumb", "/api/files/j2/display", "/api/files/j2/thumb"],
      drop: ["/api/files/p2/original"],
    });
  });
});

test("what can't be kept, in words that welcome a PDF", () => {
  expect(paperProblem("type")).toMatch(/a PDF, or a photo/);
  expect(paperProblem("big")).toMatch(/up to 30 MB each/);
  expect(paperProblem("heic")).toMatch(/HEIC/);
});
