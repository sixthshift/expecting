// The tools that fetch what was kept as a file: a photo or scan, and a
// result or paper's pages. A picture comes as its display copy (a JPEG made
// on the phone); a PDF as itself. Expecting never reads them; Claude may,
// when asked (docs/plan-mcp.md).

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { FilesRepo } from "../../db/models/files/repo";
import { PapersRepo } from "../../db/models/papers/repo";
import { PhotosRepo } from "../../db/models/photos/repo";
import { isImage, MADE_TYPE } from "../../lib/files";
import { FileStore } from "../../server/files/store";
import type { Context } from "./context";
import { refuse } from "./tools";

const READ = { readOnlyHint: true, openWorldHint: false } as const;

type Part = CallToolResult["content"][number];

/** An upload as something Claude can look at: a picture's display copy, or a PDF; null when its bytes are gone. */
async function partOf(ctx: Context, fileId: string): Promise<Part | null> {
  const row = new FilesRepo(ctx.db).get(fileId);
  if (!row) return null;
  const store = new FileStore();
  if (isImage(row.type)) {
    const display = store.path(fileId, "display");
    const path = display ?? store.path(fileId, "original");
    if (!path) return null;
    return { type: "image", data: Buffer.from(await Bun.file(path).arrayBuffer()).toString("base64"), mimeType: display ? MADE_TYPE : row.type };
  }
  const path = store.path(fileId, "original");
  if (!path) return null;
  return {
    type: "resource",
    resource: { uri: `expecting:/files/${fileId}`, mimeType: row.type, blob: Buffer.from(await Bun.file(path).arrayBuffer()).toString("base64") },
  };
}

export function fileTools(server: McpServer, ctx: () => Context) {
  server.registerTool(
    "get_photo",
    {
      title: "Look at a photo or scan",
      description: "A photo or scan from the Journal, by its id (from journal), as an image.",
      inputSchema: { id: z.uuid() },
      annotations: READ,
    },
    async ({ id }) => {
      const c = ctx();
      const photo = new PhotosRepo(c.db).get(id);
      const part = photo ? await partOf(c, photo.fileId) : null;
      if (!photo || !part) return refuse(`No photo ${id}.`);
      return { content: [{ type: "text", text: [photo.kind, photo.day, photo.caption].filter(Boolean).join(" · ") }, part] };
    }
  );

  server.registerTool(
    "get_paper",
    {
      title: "Look at a result or paper",
      description:
        "A result, letter or other paper from the Journal, by its id (from journal): its pages, as images or a PDF. Describe what's written if asked, but never call a value normal or not: that is for the midwife or doctor who ordered it.",
      inputSchema: { id: z.uuid() },
      annotations: READ,
    },
    async ({ id }) => {
      const c = ctx();
      const paper = new PapersRepo(c.db).get(id);
      if (!paper) return refuse(`No paper ${id}.`);
      const parts = (await Promise.all(paper.pages.map((p) => partOf(c, p.fileId)))).filter((p): p is Part => p !== null);
      return { content: [{ type: "text", text: [paper.title, paper.kind, paper.day, paper.note].filter(Boolean).join(" · ") }, ...parts] };
    }
  );
}
