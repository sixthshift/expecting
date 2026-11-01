// Results and papers: a blood test, a screening result, a referral letter, the
// birth plan, the discharge summary, each photographed (a page a photo) or
// kept as a PDF, kept by either of you and seen by both. Expecting keeps them
// and finds them; it never reads them, so nothing here knows what a paper
// says. The files are uploads (./files.ts); this is the record around them.
// Its week is worked out from the due date as it's read, as a note's is.
// See docs/product/journal.md.

import type { ISODate } from "./dates";
import { FILE_PROBLEM, type FileProblem, type FileType, fileUrl, isImage, MAX_ORIGINAL } from "./files";
import { placeOf } from "./journal";
import type { QuietKind } from "./quiet";
import type { Week } from "./timeline";

/** What a paper is: a result, a letter or referral, a plan, a record or summary, or something else. */
export const PAPER_KINDS = ["result", "letter", "plan", "record", "other"] as const;
export type PaperKind = (typeof PAPER_KINDS)[number];

export const PAPER_KIND_LABEL: Record<PaperKind, string> = {
  result: "Result",
  letter: "Letter or referral",
  plan: "Plan",
  record: "Record or summary",
  other: "Something else",
};

/** The kinds as a filter says them, in the plural. */
export const PAPER_KIND_PLURAL: Record<PaperKind, string> = { result: "Results", letter: "Letters", plan: "Plans", record: "Records", other: "Other" };

/** What each kind covers, said once under the choice. */
export const PAPER_KIND_HINT: Record<PaperKind, string> = {
  result: "Blood tests, screening, the glucose test, a scan report",
  letter: "A referral, a letter from the hospital or a specialist",
  plan: "The birth plan, a feeding or care plan",
  record: "The pregnancy record, the discharge summary, the baby's health record book",
  other: "A form, a receipt, a certificate",
};

/** A name to suggest, by what it is. */
export const PAPER_TITLE_PLACEHOLDER: Record<PaperKind, string> = {
  result: "Pathology results",
  letter: "Referral to the hospital",
  plan: "Our birth plan",
  record: "Discharge summary",
  other: "Medicare enrolment form",
};

/**
 * The Library entries a paper can be about: the tests, letters, plans and
 * records that come as paper, each with the name it gives a paper, and
 * whether a paper about it is handy by default (asked for at the desk, or
 * at triage). Never a private entry (test/lib/papers.test.ts).
 */
export type PaperTopic = { id: string; kind: Exclude<PaperKind, "other">; title: string; handy?: true };

export const PAPER_TOPICS: readonly PaperTopic[] = [
  { id: "first-blood-tests", kind: "result", title: "First blood tests" },
  { id: "blood-group-and-antibodies", kind: "result", title: "Blood group and antibodies", handy: true },
  { id: "early-diabetes-test", kind: "result", title: "Early diabetes test" },
  { id: "dating-scan", kind: "result", title: "Dating scan report" },
  { id: "carrier-screening", kind: "result", title: "Carrier screening" },
  { id: "nuchal-translucency-scan", kind: "result", title: "Nuchal translucency scan report" },
  { id: "combined-first-trimester-screening", kind: "result", title: "First-trimester screening" },
  { id: "nipt", kind: "result", title: "NIPT" },
  { id: "cvs", kind: "result", title: "CVS" },
  { id: "amniocentesis", kind: "result", title: "Amniocentesis" },
  { id: "second-trimester-serum-screening", kind: "result", title: "Second-trimester serum screening" },
  { id: "cervical-screening-test", kind: "result", title: "Cervical screening" },
  { id: "urine-culture", kind: "result", title: "Urine culture" },
  { id: "morphology-scan", kind: "result", title: "Morphology scan report" },
  { id: "glucose-tolerance-test", kind: "result", title: "Glucose tolerance test" },
  { id: "rhd-nipt", kind: "result", title: "The baby's RhD group" },
  { id: "third-trimester-bloods", kind: "result", title: "28-week blood tests" },
  { id: "growth-scans", kind: "result", title: "Growth scan report" },
  { id: "group-b-strep-swab", kind: "result", title: "Group B strep swab" },
  { id: "newborn-bloodspot-screening", kind: "result", title: "Heel prick test" },
  { id: "booking-in", kind: "letter", title: "Referral to the hospital", handy: true },
  { id: "gp-shared-care", kind: "letter", title: "Shared care letter" },
  { id: "genetic-counselling", kind: "letter", title: "Genetic counselling letter" },
  { id: "birth-preferences", kind: "plan", title: "Birth plan", handy: true },
  { id: "feeding-plan", kind: "plan", title: "Feeding plan", handy: true },
  { id: "anti-d", kind: "record", title: "Anti-D record" },
  { id: "going-home", kind: "record", title: "Discharge summary", handy: true },
  { id: "my-health-record-for-baby", kind: "record", title: "The baby's health record book" },
];

export function paperTopic(id: string | null): PaperTopic | null {
  return id ? (PAPER_TOPICS.find((t) => t.id === id) ?? null) : null;
}

/** A page of a paper: an upload, and what it is (from the upload, as the server sniffed it). */
export type PaperPage = { fileId: string; type: FileType; name: string; size: number };

export type Paper = {
  id: string;
  kind: PaperKind;
  title: string;
  /** The Library entry it's about, if any. */
  itemId: string | null;
  /** The date on it, YYYY-MM-DD. */
  day: string;
  note: string | null;
  /** On top, on Emergency info, and kept on each phone for offline. */
  handy: boolean;
  /** In order: one PDF, or a photo a page. */
  pages: PaperPage[];
  by: string | null;
  createdAt: string;
  editedBy: string | null;
  editedAt: string | null;
};

/**
 * What a phone sends for a new paper, once its pages are on their way. The
 * pages carry what the phone knows of each file, to show it at once; the
 * server takes each page's type, name and size from its upload, never from here.
 */
export type PaperInput = Pick<Paper, "id" | "kind" | "title" | "itemId" | "day" | "note" | "handy" | "pages">;

/** What a phone sends to change one: never its pages. */
export type PaperChange = Pick<Paper, "id" | "kind" | "title" | "itemId" | "day" | "note" | "handy">;

/** The most pages a paper takes: a long discharge summary, photographed. */
export const MAX_PAGES = 30;

/** Words as kept: trimmed, and none rather than blank. */
export function tidyWords(words: string | null): string | null {
  const tidy = words?.trim() ?? "";
  return tidy.length > 0 ? tidy : null;
}

/** A title as kept: trimmed. Never blank (the form waits for one). */
export function tidyTitle(title: string): string {
  return title.trim();
}

/** Handy first, then newest by the date on it, then by when it was kept. */
export function ordered<T extends Pick<Paper, "handy" | "day" | "createdAt">>(papers: readonly T[]): T[] {
  return [...papers].sort((a, b) => Number(b.handy) - Number(a.handy) || b.day.localeCompare(a.day) || b.createdAt.localeCompare(a.createdAt));
}

/** Whether a paper has every word of `query` in its name, kind, what it's about, or its words. An empty query matches all. */
export function paperMatches(paper: Paper, query: string): boolean {
  const topic = paperTopic(paper.itemId);
  const text = [paper.title, PAPER_KIND_LABEL[paper.kind], topic?.title, paper.note].filter(Boolean).join(" ").toLocaleLowerCase("en-AU");
  return query
    .toLocaleLowerCase("en-AU")
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => text.includes(word));
}

/** The kinds there are papers of, in their usual order: what the filter offers. */
export function kindsKept(papers: readonly Paper[]): PaperKind[] {
  return PAPER_KINDS.filter((k) => papers.some((p) => p.kind === k));
}

/** A week span, as a Library entry has. */
type Span = { from: Week; to: Week } | null;

/**
 * What a paper of `kind` can be about, as things stand: the topics of that
 * kind, those whose weeks hold `week` first, then by how near they are.
 * None after a loss (the list is the birth plan and the morphology scan),
 * and none for something else.
 */
export function topicsFor(kind: PaperKind, { week, quiet, span }: { week: Week | null; quiet: QuietKind | null; span: (id: string) => Span }): PaperTopic[] {
  if (quiet === "loss") return [];
  const of = PAPER_TOPICS.filter((t) => t.kind === kind);
  if (week === null) return of;
  const distance = (t: PaperTopic) => {
    const s = span(t.id);
    if (!s) return Number.POSITIVE_INFINITY;
    return week < s.from ? s.from - week : week > s.to ? week - s.to : 0;
  };
  return of
    .map((t, i) => ({ t, i, d: distance(t) }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .map(({ t }) => t);
}

/** Whether a new paper is handy unless you say otherwise: a plan, or one about an entry that's asked for at the desk. Never after a loss. */
export function handyByDefault(kind: PaperKind | null, itemId: string | null, quiet: QuietKind | null): boolean {
  if (quiet === "loss") return false;
  return kind === "plan" || Boolean(paperTopic(itemId)?.handy);
}

/** Where a day falls, as a paper's week: its week, or null outside the pregnancy or without a due date. */
export function paperWeek(day: string, dueDate: ISODate | null): Week | null {
  if (!dueDate) return null;
  const place = placeOf(day as ISODate, dueDate);
  return typeof place === "number" ? place : null;
}

/** What a week was dated with, by kind, for its line on the timeline. */
export type WeekPapers = Partial<Record<PaperKind, number>>;

export function weekPapers(papers: readonly Paper[], week: Week, dueDate: ISODate | null): WeekPapers {
  const counts: WeekPapers = {};
  for (const paper of papers) if (paperWeek(paper.day, dueDate) === week) counts[paper.kind] = (counts[paper.kind] ?? 0) + 1;
  return counts;
}

const WEEK_WORD: Record<PaperKind, [string, string]> = {
  result: ["result", "results"],
  letter: ["letter", "letters"],
  plan: ["plan", "plans"],
  record: ["record", "records"],
  other: ["paper", "papers"],
};

/** A week's papers in words: "result", "2 results", "letter". */
export function weekPaperWords(counts: WeekPapers): string[] {
  return PAPER_KINDS.flatMap((kind) => {
    const n = counts[kind] ?? 0;
    if (n === 0) return [];
    const [one, many] = WEEK_WORD[kind];
    return [n === 1 ? one : `${n} ${many}`];
  });
}

/** Whether a page is a picture (drawn in the app) or a PDF (opened in the phone's own viewer). */
export function isPicturePage(page: PaperPage): boolean {
  return isImage(page.type);
}

/**
 * What each phone keeps for reading with no signal: every page of a handy
 * paper (a picture's display copy and thumbnail, a PDF itself), and which
 * PDFs to let go, once their paper isn't handy any more. A picture's copies
 * are kept as they're drawn anyway, handy or not.
 */
export function offlineFiles(papers: readonly Paper[]): { keep: string[]; drop: string[] } {
  const keep: string[] = [];
  const drop: string[] = [];
  for (const paper of papers) {
    for (const page of paper.pages) {
      if (isPicturePage(page)) {
        if (paper.handy) keep.push(fileUrl(page.fileId, "display"), fileUrl(page.fileId, "thumb"));
      } else (paper.handy ? keep : drop).push(fileUrl(page.fileId, "original"));
    }
  }
  return { keep, drop };
}

/** What went wrong with a file, in words for a paper: a PDF is welcome here. */
export function paperProblem(problem: FileProblem): string {
  if (problem === "type") return "That isn't a file Expecting can keep: a PDF, or a photo (JPEG, PNG, WebP or HEIC).";
  if (problem === "big") return `That file is too big: up to ${MAX_ORIGINAL / (1024 * 1024)} MB each.`;
  return FILE_PROBLEM[problem];
}
