// When a JPEG says it was taken: EXIF's DateTimeOriginal (or, failing that,
// DateTime), read from the file's first bytes. So a bump photo chosen from
// the camera roll a week late lands on the day it was taken, not the day it
// was added. Pure, and only as much of EXIF as that needs.

import { type ISODate, isISODate } from "./dates";

const SOI = 0xffd8;
const APP1 = 0xffe1;
const SOS = 0xffda;

const TAG_DATE_TIME = 0x0132;
const TAG_EXIF_IFD = 0x8769;
const TAG_DATE_TIME_ORIGINAL = 0x9003;

const TYPE_ASCII = 2;
const TYPE_LONG = 4;

/** When a photo was taken, as its camera wrote it (the camera's own clock and zone). */
export type TakenAt = { day: ISODate; time: string };

/** "2026:10:27 09:41:05" as a day and an HH:MM; null for anything else (cameras write "0000:00:00 00:00:00" for unknown). */
export function parseExifDate(text: string): TakenAt | null {
  const m = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2})/.exec(text);
  if (!m) return null;
  const day = `${m[1]}-${m[2]}-${m[3]}`;
  if (!isISODate(day) || Number(m[4]) > 23 || Number(m[5]) > 59) return null;
  return { day, time: `${m[4]}:${m[5]}` };
}

/** The JPEG's taken-at, from its first bytes (the EXIF block is near the start; 128 KB is plenty); null without one. */
export function exifTakenAt(bytes: Uint8Array): TakenAt | null {
  try {
    const tiff = exifBlock(bytes);
    return tiff ? readDates(bytes, tiff) : null;
  } catch {
    // A truncated or odd block: no date, rather than no photo.
    return null;
  }
}

/** Where the TIFF header of the APP1 Exif segment starts; null if there isn't one before the image data. */
function exifBlock(bytes: Uint8Array): number | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 4 || view.getUint16(0) !== SOI) return null;
  let at = 2;
  while (at + 4 <= bytes.length) {
    const marker = view.getUint16(at);
    if ((marker & 0xff00) !== 0xff00 || marker === SOS) return null;
    const length = view.getUint16(at + 2);
    if (marker === APP1 && at + 10 <= bytes.length && String.fromCharCode(...bytes.subarray(at + 4, at + 10)) === "Exif\0\0") return at + 10;
    at += 2 + length;
  }
  return null;
}

function readDates(bytes: Uint8Array, tiff: number): TakenAt | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const order = String.fromCharCode(bytes[tiff]!, bytes[tiff + 1]!);
  if (order !== "II" && order !== "MM") return null;
  const little = order === "II";
  const u16 = (at: number) => view.getUint16(at, little);
  const u32 = (at: number) => view.getUint32(at, little);
  if (u16(tiff + 2) !== 42) return null;

  /** Each entry of the IFD at `offset` (from the TIFF header): its tag, type, count and where its value is. */
  function entries(offset: number): { tag: number; type: number; count: number; value: number }[] {
    const start = tiff + offset;
    const n = u16(start);
    return Array.from({ length: n }, (_, i) => {
      const e = start + 2 + i * 12;
      return { tag: u16(e), type: u16(e + 2), count: u32(e + 4), value: e + 8 };
    });
  }

  function text(entry: { type: number; count: number; value: number }): string | null {
    if (entry.type !== TYPE_ASCII) return null;
    const at = entry.count > 4 ? tiff + u32(entry.value) : entry.value;
    if (at + entry.count > bytes.length) return null;
    return String.fromCharCode(...bytes.subarray(at, at + entry.count)).replace(/\0+$/, "");
  }

  const ifd0 = entries(u32(tiff + 4));
  const pointer = ifd0.find((e) => e.tag === TAG_EXIF_IFD && e.type === TYPE_LONG);
  const original = pointer ? entries(u32(pointer.value)).find((e) => e.tag === TAG_DATE_TIME_ORIGINAL) : undefined;
  const fromOriginal = original ? text(original) : null;
  if (fromOriginal && parseExifDate(fromOriginal)) return parseExifDate(fromOriginal);
  const modified = ifd0.find((e) => e.tag === TAG_DATE_TIME);
  const fromModified = modified ? text(modified) : null;
  return fromModified ? parseExifDate(fromModified) : null;
}
