import { describe, expect, test } from "vitest";
import { exifTakenAt, parseExifDate } from "../../src/lib/exif";

/** A JPEG's first bytes with an EXIF block: DateTime in IFD0 and, if given, DateTimeOriginal in the Exif IFD. */
function jpeg({ original, modified, little = true }: { original?: string; modified?: string; little?: boolean }): Uint8Array {
  const tiff = new Uint8Array(200);
  const v = new DataView(tiff.buffer);
  tiff.set(little ? [0x49, 0x49] : [0x4d, 0x4d], 0);
  v.setUint16(2, 42, little);
  v.setUint32(4, 8, little);
  const entries: [number, number, number, number][] = [];
  const DATA = 120;
  const EXIF_IFD = 60;
  if (modified) entries.push([0x0132, 2, 20, DATA]);
  if (original) entries.push([0x8769, 4, 1, EXIF_IFD]);
  v.setUint16(8, entries.length, little);
  entries.forEach(([tag, type, count, value], i) => {
    const at = 10 + i * 12;
    v.setUint16(at, tag, little);
    v.setUint16(at + 2, type, little);
    v.setUint32(at + 4, count, little);
    v.setUint32(at + 8, value, little);
  });
  if (modified)
    tiff.set(
      [...`${modified}\0`].map((c) => c.charCodeAt(0)),
      DATA
    );
  if (original) {
    v.setUint16(EXIF_IFD, 1, little);
    v.setUint16(EXIF_IFD + 2, 0x9003, little);
    v.setUint16(EXIF_IFD + 4, 2, little);
    v.setUint32(EXIF_IFD + 6, 20, little);
    v.setUint32(EXIF_IFD + 10, DATA + 24, little);
    tiff.set(
      [...`${original}\0`].map((c) => c.charCodeAt(0)),
      DATA + 24
    );
  }
  const app1 = [0xff, 0xe1, 0, 0, ...[..."Exif\0\0"].map((c) => c.charCodeAt(0)), ...tiff];
  const length = app1.length - 2;
  app1[2] = length >> 8;
  app1[3] = length & 0xff;
  // A JFIF APP0 first, as most cameras write, then the EXIF.
  const app0 = [0xff, 0xe0, 0, 16, ...[..."JFIF\0"].map((c) => c.charCodeAt(0)), 1, 1, 0, 0, 1, 0, 1, 0, 0];
  return new Uint8Array([0xff, 0xd8, ...app0, ...app1, 0xff, 0xda, 0, 2]);
}

describe("exifTakenAt", () => {
  test("the day and time the camera took it", () => {
    expect(exifTakenAt(jpeg({ original: "2026:10:27 09:41:05", modified: "2026:10:29 20:00:00" }))).toEqual({ day: "2026-10-27", time: "09:41" });
  });

  test("in either byte order", () => {
    expect(exifTakenAt(jpeg({ original: "2026:07:08 18:05:00", little: false }))).toEqual({ day: "2026-07-08", time: "18:05" });
  });

  test("when it was last changed, if that's all it says", () => {
    expect(exifTakenAt(jpeg({ modified: "2026:09:02 07:30:00" }))).toEqual({ day: "2026-09-02", time: "07:30" });
  });

  test("nothing from a camera that didn't know, a file without EXIF, or one that isn't a JPEG", () => {
    expect(exifTakenAt(jpeg({ original: "0000:00:00 00:00:00" }))).toBeNull();
    expect(exifTakenAt(new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2]))).toBeNull();
    expect(exifTakenAt(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
    // Cut short: no date, rather than a failure.
    expect(exifTakenAt(jpeg({ original: "2026:10:27 09:41:05" }).slice(0, 40))).toBeNull();
  });
});

test("parseExifDate", () => {
  expect(parseExifDate("2026:02:28 23:59:59")).toEqual({ day: "2026-02-28", time: "23:59" });
  expect(parseExifDate("2026:02:30 10:00:00")).toBeNull();
  expect(parseExifDate("2026-02-28 10:00")).toBeNull();
});
