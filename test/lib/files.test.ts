import { expect, test } from "vitest";
import { fileUrl, fitWithin, formatSize, sniff } from "../../src/lib/files";

const bytes = (...parts: (number[] | string)[]) => new Uint8Array(parts.flatMap((p) => (typeof p === "string" ? [...p].map((c) => c.charCodeAt(0)) : p)));

test("a file's type is told from its first bytes, never its name", () => {
  expect(sniff(bytes([0xff, 0xd8, 0xff, 0xe1]))).toBe("image/jpeg");
  expect(sniff(bytes([0x89], "PNG", [0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
  expect(sniff(bytes("RIFF", [0, 0, 0, 0], "WEBPVP8 "))).toBe("image/webp");
  expect(sniff(bytes([0, 0, 0, 0x18], "ftypheic", [0, 0, 0, 0]))).toBe("image/heic");
  expect(sniff(bytes([0, 0, 0, 0x18], "ftypmif1", [0, 0, 0, 0]))).toBe("image/heif");
  expect(sniff(bytes("%PDF-1.7\n"))).toBe("application/pdf");
  // Nothing that can run in the page, and nothing else.
  expect(sniff(bytes('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeNull();
  expect(sniff(bytes("<!doctype html>"))).toBeNull();
  expect(sniff(bytes([0, 0, 0, 0x18], "ftypavif", [0, 0, 0, 0]))).toBeNull();
  expect(sniff(bytes("GIF89a"))).toBeNull();
  expect(sniff(new Uint8Array())).toBeNull();
});

test("a copy is made to fit its long edge, never larger than the original", () => {
  expect(fitWithin(3024, 4032, 2048)).toEqual({ width: 1536, height: 2048 });
  expect(fitWithin(4032, 3024, 480)).toEqual({ width: 480, height: 360 });
  expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 });
});

test("where an upload's part is served, behind the gate", () => {
  expect(fileUrl("abc", "thumb")).toBe("/api/files/abc/thumb");
  expect(fileUrl("abc", "original", { download: true })).toBe("/api/files/abc/original?download");
});

test("a size in words", () => {
  expect(formatSize(2.4 * 1024 * 1024)).toBe("2.4 MB");
  expect(formatSize(380 * 1024)).toBe("380 KB");
  expect(formatSize(10)).toBe("1 KB");
});
