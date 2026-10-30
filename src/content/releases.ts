// What changed for the household in each release, from content/releases/<version>.md,
// written by the release workflow (scripts/version.ts) as it bumps the version,
// so the build that carries a version carries its notes. A release with nothing
// the household would notice has no file. The app shows the notes once, after an
// update (src/app/components/WhatsNew.tsx).

export type Release = { version: string; notes: string };

const VERSION_FILE = /\/(\d+\.\d+\.\d+)\.md$/;

/** The releases in `files` (path → markdown), oldest first. Throws on a file not named for a version. Pure. */
export function parseReleases(files: Record<string, string>): Release[] {
  return Object.entries(files)
    .map(([path, notes]) => {
      const version = VERSION_FILE.exec(path)?.[1];
      if (!version) throw new Error(`${path}: a release is named for its version, like 1.2.3.md`);
      return { version, notes: notes.trim() };
    })
    .sort((a, b) => compareVersions(a.version, b.version));
}

/** Negative when `a` is older than `b`, positive when newer, 0 when the same. Anything not x.y.z counts as 0.0.0. Pure. */
export function compareVersions(a: string, b: string): number {
  const parts = (version: string) => (/^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim())?.slice(1) ?? [0, 0, 0]).map(Number);
  const [x, y] = [parts(a), parts(b)];
  return x[0]! - y[0]! || x[1]! - y[1]! || x[2]! - y[2]!;
}

/** The releases after `seen`, up to and including `current`, oldest first. Pure. */
export function releasesSince(releases: readonly Release[], seen: string, current: string): Release[] {
  return releases.filter((r) => compareVersions(r.version, seen) > 0 && compareVersions(r.version, current) <= 0);
}

const files = import.meta.glob<string>("../../content/releases/*.md", { query: "?raw", eager: true, import: "default" });

/** Every release with notes, oldest first. */
export const releases: readonly Release[] = parseReleases(files);
