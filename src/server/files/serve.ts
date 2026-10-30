// An upload's part, answered for GET /api/files/<id>/<variant>
// (src/api/rest/files.ts), behind the gate like every /api/* path.

import type { Database } from "bun:sqlite";
import { FilesRepo } from "../../db/models/files/repo";
import { MADE_TYPE, VARIANTS, type Variant } from "../../lib/files";
import { getDb } from "../core/db";
import { FileStore } from "./store";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** A file name safe in a header: the name as given, for `filename*`, and a plain fallback. */
function disposition(kind: "inline" | "attachment", name: string): string {
  const plain = name.replace(/[^\w.\- ]+/g, "_");
  return `${kind}; filename="${plain}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/**
 * The bytes, with the type that was sniffed as they arrived (a copy is
 * always a JPEG), never sniffed again by the browser. An upload never
 * changes (each is a new id), so it's kept as long as the phone likes, and
 * only by that phone. `?download` sends it as an attachment, under its name.
 * Anything not kept is a 404.
 */
export function serveFile(request: Request, params: { id: string; variant: string }, db: Database = getDb(), store = new FileStore()): Response {
  const { id, variant } = params;
  if (!UUID.test(id) || !VARIANTS.includes(variant as Variant)) return new Response("Not found", { status: 404 });
  const row = new FilesRepo(db).get(id);
  const path = row ? store.path(id, variant as Variant) : null;
  if (!row || !path) return new Response("Not found", { status: 404 });
  const download = new URL(request.url).searchParams.has("download");
  return new Response(Bun.file(path), {
    headers: {
      "content-type": variant === "original" ? row.type : MADE_TYPE,
      "cache-control": "private, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-disposition": disposition(download ? "attachment" : "inline", variant === "original" ? row.name : `${variant}.jpg`),
    },
  });
}
