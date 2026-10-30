// The household's notes for each release, and which of them a phone has yet to see.
import { describe, expect, test } from "vitest";
import { compareVersions, parseReleases, releases, releasesSince } from "../../src/content/releases";

describe("compareVersions", () => {
  test("orders by major, then minor, then patch, as numbers", () => {
    expect(compareVersions("0.10.0", "0.9.9")).toBeGreaterThan(0);
    expect(compareVersions("1.0.0", "0.99.99")).toBeGreaterThan(0);
    expect(compareVersions("0.2.1", "0.2.10")).toBeLessThan(0);
    expect(compareVersions("0.3.0", "0.3.0")).toBe(0);
  });

  test("a dev build's version counts as 0.0.0", () => {
    expect(compareVersions("0.0.0-dev", "0.0.0")).toBe(0);
  });
});

describe("releasesSince", () => {
  const all = parseReleases({ "r/0.2.0.md": "a", "r/0.10.0.md": "c", "r/0.3.0.md": "b" });

  test("are oldest first", () => {
    expect(all.map((r) => r.version)).toEqual(["0.2.0", "0.3.0", "0.10.0"]);
  });

  test("are those after the one seen, up to the one running", () => {
    expect(releasesSince(all, "0.2.0", "0.10.0").map((r) => r.version)).toEqual(["0.3.0", "0.10.0"]);
    expect(releasesSince(all, "0.2.0", "0.3.5").map((r) => r.version)).toEqual(["0.3.0"]);
  });

  test("none when nothing is newer, or the phone is ahead of the build", () => {
    expect(releasesSince(all, "0.10.0", "0.10.0")).toEqual([]);
    expect(releasesSince(all, "0.11.0", "0.10.0")).toEqual([]);
  });
});

describe("content/releases", () => {
  test("every file is named for a version and says something", () => {
    for (const release of releases) expect(release.notes).not.toBe("");
  });

  test("a file not named for a version fails", () => {
    expect(() => parseReleases({ "r/next.md": "x" })).toThrow(/named for its version/);
  });
});
