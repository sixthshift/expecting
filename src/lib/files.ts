// Uploads: files kept for a record (a photo, a scan, later a result or a
// paper), whatever the record. Pure: what's taken, how it's told apart, how
// big, and where it's served. The store is src/server/files/store.ts; the
// phone's half is src/app/model/uploads.ts ("make ready", kept until sent).

/** What the store takes, by type: pictures and PDFs. Never SVG or HTML, nothing that can run in the page. */
export const FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"] as const;

export type FileType = (typeof FILE_TYPES)[number];

/** Each upload's parts: the file as given, and for a picture a display copy and a thumbnail, made on the phone. */
export const VARIANTS = ["original", "display", "thumb"] as const;

export type Variant = (typeof VARIANTS)[number];

/** The largest file taken, as given: a phone's photo is a few MB, a scanned PDF more. */
export const MAX_ORIGINAL = 30 * 1024 * 1024;

/** The largest display copy and thumbnail taken. They are made well under it. */
export const MAX_MADE: Record<Exclude<Variant, "original">, number> = { display: 6 * 1024 * 1024, thumb: 1024 * 1024 };

/** The long edge each copy is made at, in pixels, and its JPEG quality. */
export const MADE_AT: Record<Exclude<Variant, "original">, { edge: number; quality: number }> = {
  display: { edge: 2048, quality: 0.85 },
  thumb: { edge: 480, quality: 0.8 },
};

/** The display copy and thumbnail are always JPEG: every browser makes one, and every browser shows one. */
export const MADE_TYPE: FileType = "image/jpeg";

/** An upload as kept: what it was called, its type (sniffed), its size, a picture's size, which copies it has, who and when. */
export type Upload = {
  id: string;
  name: string;
  type: FileType;
  size: number;
  width: number | null;
  height: number | null;
  display: boolean;
  thumb: boolean;
  by: string | null;
  createdAt: string;
};

export function isImage(type: FileType): boolean {
  return type.startsWith("image/");
}

/** Whether a browser can draw it as is: HEIC only Safari, so a HEIC upload is shown by its display copy. */
export function isDrawable(type: FileType): boolean {
  return type === "image/jpeg" || type === "image/png" || type === "image/webp";
}

function ascii(bytes: Uint8Array, from: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(from, from + length));
}

/** HEIC's brands; `mif1` and `msf1` are HEIF's generic ones, which an iPhone writes too. */
const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis"]);
const HEIF_BRANDS = new Set(["mif1", "msf1"]);

/**
 * A file's type from its first bytes (16 are enough), never from its name or
 * what the browser says: null for anything the store doesn't take.
 */
export function sniff(head: Uint8Array): FileType | null {
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head.length >= 8 && ascii(head, 1, 3) === "PNG" && head[0] === 0x89 && head[4] === 0x0d && head[5] === 0x0a) return "image/png";
  if (head.length >= 12 && ascii(head, 0, 4) === "RIFF" && ascii(head, 8, 4) === "WEBP") return "image/webp";
  if (head.length >= 5 && ascii(head, 0, 5) === "%PDF-") return "application/pdf";
  if (head.length >= 12 && ascii(head, 4, 4) === "ftyp") {
    const brand = ascii(head, 8, 4);
    if (HEIC_BRANDS.has(brand)) return "image/heic";
    if (HEIF_BRANDS.has(brand)) return "image/heif";
  }
  return null;
}

/** A size to draw at: `width` × `height` scaled down to fit `edge` on its long side, never up. */
export function fitWithin(width: number, height: number, edge: number): { width: number; height: number } {
  const scale = Math.min(1, edge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Where an upload's part is served, behind the gate (src/api/rest/files.ts). `download` sends it as an attachment, under its own name. */
export function fileUrl(id: string, variant: Variant, { download = false }: { download?: boolean } = {}): string {
  return `/api/files/${id}/${variant}${download ? "?download" : ""}`;
}

/** "2.4 MB", "380 KB". */
export function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** What went wrong with a file, in words for the person who chose it. */
export type FileProblem = "big" | "type" | "heic" | "unreadable";

export const FILE_PROBLEM: Record<FileProblem, string> = {
  big: `That file is too big: up to ${MAX_ORIGINAL / (1024 * 1024)} MB.`,
  type: "That isn't a photo Expecting can keep: JPEG, PNG, WebP or HEIC.",
  heic: "This browser can't open that photo (HEIC). Add it from the iPhone, or save it as a JPEG first.",
  unreadable: "That photo couldn't be opened. Try another, or take it again.",
};
