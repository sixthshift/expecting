// A paper in a list: its first page small, its name, and what and when, with
// a pin when it's kept handy. The same row in the Journal, on Emergency info
// and under a Library entry.

import { cn } from "@sixthshift/design-system/utils";
import { FileText, Pin } from "lucide-react";
import type { ISODate } from "../../../../lib/dates";
import { isPicturePage, PAPER_KIND_LABEL, type Paper, type PaperPage, paperWeek } from "../../../../lib/papers";
import { weekLabel } from "../../../../lib/timeline";
import { Picture } from "../photos/Picture";
import { dated } from "./PaperFields";

/** What it is and when: "Result · Dated Mon 26 Oct · Week 27 · 3 pages". */
export function paperLine(paper: Paper, dueDate: ISODate | null): string {
  const week = paperWeek(paper.day, dueDate);
  const pages = paper.pages.length > 1 ? `${paper.pages.length} pages` : null;
  return [PAPER_KIND_LABEL[paper.kind], dated(paper.day), week !== null ? weekLabel(week) : null, pages].filter(Boolean).join(" · ");
}

/** A page, small: a picture's thumbnail, or a PDF's tile. */
export function PageThumb({ page, alt, className }: { page: PaperPage | undefined; alt: string; className?: string }) {
  if (page && isPicturePage(page)) return <Picture fileId={page.fileId} variant="thumb" alt={alt} className={cn("rounded-md object-cover", className)} />;
  return (
    <span
      {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
      className={cn("flex flex-col items-center justify-center gap-0.5 rounded-md bg-bg-subtle text-fg-brand", className)}
    >
      <FileText aria-hidden size={20} />
      <span aria-hidden className="text-[10px] font-semibold text-fg-subtle">
        PDF
      </span>
    </span>
  );
}

export function PaperRow({ paper, dueDate, onOpen }: { paper: Paper; dueDate: ISODate | null; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-14 w-full items-center gap-3 rounded-md p-2 text-left hover:bg-bg-normal-hovered focus-visible:ring-2 focus-visible:ring-border-focus"
    >
      <PageThumb page={paper.pages[0]} alt="" className="size-12 shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-fg-strong">{paper.title}</span>
        <span className="truncate text-xs text-fg-subtle">{paperLine(paper, dueDate)}</span>
      </span>
      {paper.handy ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-fg-brand">
          <Pin aria-hidden size={14} />
          <span className="sr-only sm:not-sr-only">Handy</span>
        </span>
      ) : null}
    </button>
  );
}
