import type { Database } from "bun:sqlite";
import { asc, eq } from "drizzle-orm";
import { type Paper, type PaperChange, type PaperInput, type PaperPage, tidyTitle, tidyWords } from "../../../lib/papers";
import { orm } from "../../connection/client";
import { upload } from "../files/schema";
import { paper, paperPage } from "./schema";

/** A paper's row, without its pages. */
type PaperRow = Omit<Paper, "pages">;

export class PapersRepo {
  private readonly db;

  constructor(db: Database) {
    this.db = orm(db);
  }

  /** Each paper's pages, in order, with what each file is (as the upload says). */
  private pages(): Map<string, PaperPage[]> {
    const rows = this.db
      .select({ paperId: paperPage.paperId, fileId: paperPage.fileId, type: upload.type, name: upload.name, size: upload.size })
      .from(paperPage)
      .innerJoin(upload, eq(upload.id, paperPage.fileId))
      .orderBy(asc(paperPage.paperId), asc(paperPage.position))
      .all();
    const by = new Map<string, PaperPage[]>();
    for (const { paperId, ...page } of rows) by.set(paperId, [...(by.get(paperId) ?? []), page]);
    return by;
  }

  /** Every paper, with its pages; the page orders them. Shared: both of you see all of them. */
  list(): Paper[] {
    const pages = this.pages();
    return this.db
      .select()
      .from(paper)
      .all()
      .map((row: PaperRow) => ({ ...row, pages: pages.get(row.id) ?? [] }));
  }

  get(id: string): Paper | null {
    const row = this.db.select().from(paper).where(eq(paper.id, id)).get();
    return row ? { ...row, pages: this.pages().get(id) ?? [] } : null;
  }

  /**
   * Keep a paper and its pages, by the id the phone gave it, once every page's
   * upload is here; one already here (the same save, sent twice) is left as it
   * is. Each page's type, name and size come from its upload.
   */
  add(input: PaperInput, by: string | null, now: Date = new Date()): Paper {
    this.db.transaction((tx) => {
      const added = tx
        .insert(paper)
        .values({
          id: input.id,
          kind: input.kind,
          title: tidyTitle(input.title),
          itemId: input.itemId,
          day: input.day,
          note: tidyWords(input.note),
          handy: input.handy,
          by,
          createdAt: now.toISOString(),
          editedBy: null,
          editedAt: null,
        })
        .onConflictDoNothing()
        .returning({ id: paper.id })
        .all();
      if (added.length === 0) return;
      tx.insert(paperPage)
        .values(input.pages.map((page, position) => ({ paperId: input.id, position, fileId: page.fileId })))
        .run();
    });
    return this.get(input.id)!;
  }

  /** Change what it is, its name, what it's about, its date, its words, and whether it's handy, saying who and when. Never its pages. */
  edit({ id, ...fields }: PaperChange, by: string | null, now: Date = new Date()): void {
    this.db
      .update(paper)
      .set({ ...fields, title: tidyTitle(fields.title), note: tidyWords(fields.note), editedBy: by, editedAt: now.toISOString() })
      .where(eq(paper.id, id))
      .run();
  }

  /** Forget a paper and its pages, saying which uploads they showed (for the caller to drop); none if it wasn't here. */
  delete(id: string): string[] {
    const found = this.get(id);
    if (!found) return [];
    this.db.delete(paper).where(eq(paper.id, id)).run();
    return found.pages.map((p) => p.fileId);
  }
}
