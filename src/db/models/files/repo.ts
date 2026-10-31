import type { Database } from "bun:sqlite";
import { eq } from "drizzle-orm";
import type { Upload } from "../../../lib/files";
import { orm } from "../../connection/client";
import { upload } from "./schema";

/** Every column that points at an upload: a record's table and its column, as SQLite says (so a new record's table counts without being listed). */
type Reference = { table: string; column: string };

export class FilesRepo {
  private readonly db;

  constructor(private readonly raw: Database) {
    this.db = orm(raw);
  }

  get(id: string): Upload | null {
    return this.db.select().from(upload).where(eq(upload.id, id)).get() ?? null;
  }

  /** Keep an upload's row, by the id the phone gave it; one already here (sent twice) is left as it is. */
  add(row: Upload): Upload {
    this.db.insert(upload).values(row).onConflictDoNothing().run();
    return this.get(row.id) ?? row;
  }

  /** Forget an upload's row. Its record's row must be gone first (the reference holds it). */
  delete(id: string): void {
    this.db.delete(upload).where(eq(upload.id, id)).run();
  }

  /** The columns, in any table, that reference `upload(id)`. */
  references(): Reference[] {
    return this.raw
      .query<{ table: string; column: string }, []>(
        `SELECT m.name AS "table", f."from" AS "column"
           FROM sqlite_master m JOIN pragma_foreign_key_list(m.name) f
          WHERE m.type = 'table' AND f."table" = 'upload'`
      )
      .all();
  }

  /**
   * Uploads that arrived before `before` and that no record points to: one
   * whose record never followed (turned away, or its phone gave up). Swept
   * as later ones arrive. A record follows its upload within seconds, so a
   * day is long enough never to take one that's on its way.
   */
  unclaimed(before: Date): string[] {
    const claimed = this.references().map((r) => `SELECT "${r.column}" FROM "${r.table}" WHERE "${r.column}" IS NOT NULL`);
    const notIn = claimed.length > 0 ? `AND id NOT IN (${claimed.join(" UNION ")})` : "";
    return this.raw
      .query<{ id: string }, [string]>(`SELECT id FROM upload WHERE created_at < ? ${notIn}`)
      .all(before.toISOString())
      .map((r) => r.id);
  }
}
