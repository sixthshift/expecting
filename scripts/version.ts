// The version in package.json is bumped by .github/workflows/docker.yml on
// every push to main, and the size of the bump is read out of the commits
// being shipped (Conventional Commits). The same commits are the release's
// notes: GitHub's own generator lists merged pull requests, and this repo
// pushes straight to main, so it has nothing to list. The rules live here as
// pure functions so the workflow's decisions are testable; the CLI below is
// what the workflow calls. The household gets its own, shorter notes, bundled
// into the app as content/releases/<version>.md and shown once after an update
// (src/content/releases.ts): only what they would notice, new and fixed.
import { appendFile } from "node:fs/promises";
import { $ } from "bun";

export type Bump = "major" | "minor" | "patch";

const RANK: Record<Bump, number> = { patch: 0, minor: 1, major: 2 };
const HEADER = /^([a-zA-Z]+)(\([^)]*\))?(!)?:\s/;
const BREAKING = /^BREAKING[ -]CHANGE\s*:/m;

/** The bump one commit message asks for. Anything unconventional is a patch. Pure. */
export function bumpFor(message: string): Bump {
  const [header = "", ...body] = message.split("\n");
  const match = HEADER.exec(header.trim());
  if (match?.[3] || BREAKING.test(body.join("\n"))) return "major";
  if (match?.[1]?.toLowerCase() === "feat") return "minor";
  return "patch";
}

/** The release notes' sections, in the order they print. */
const SECTIONS = ["Breaking changes", "Features", "Fixes and performance", "Other changes"] as const;
type Section = (typeof SECTIONS)[number];

/** Commit types that change nothing a household sees; the notes leave them out. */
const HOUSEKEEPING = new Set(["chore", "test", "ci", "docs", "build"]);

/** Where one commit goes in the notes, and its line there; null to leave it out. Pure. */
export function noteFor(message: string): { section: Section; line: string } | null {
  const header = (message.split("\n")[0] ?? "").trim();
  if (header === "") return null;
  const match = HEADER.exec(header);
  if (!match) return { section: "Other changes", line: `- ${header}` };
  const type = match[1]!.toLowerCase();
  const scope = match[2]?.slice(1, -1).trim();
  const subject = header.slice(match[0].length).trim();
  const line = scope ? `- **${scope}:** ${subject}` : `- ${subject}`;
  if (bumpFor(message) === "major") return { section: "Breaking changes", line };
  if (type === "feat") return { section: "Features", line };
  if (type === "fix" || type === "perf") return { section: "Fixes and performance", line };
  if (HOUSEKEEPING.has(type)) return null;
  return { section: "Other changes", line };
}

/** Markdown notes for `messages`, given newest first as git log gives them; "" when nothing is worth saying. Pure. */
export function releaseNotes(messages: readonly string[]): string {
  const bySection = new Map<Section, string[]>();
  for (const message of [...messages].reverse()) {
    const note = noteFor(message);
    if (note) bySection.set(note.section, [...(bySection.get(note.section) ?? []), note.line]);
  }
  return SECTIONS.filter((section) => bySection.has(section))
    .map((section) => `## ${section}\n\n${bySection.get(section)!.join("\n")}\n`)
    .join("\n");
}

/** What's new's sections, by the commit types that go in them. */
const WHATS_NEW = { feat: "New", fix: "Fixed", perf: "Fixed" } as const;

/**
 * The notes the app shows the household for `messages`, given newest first: what's new and what's fixed, each line
 * its commit's subject with a capital; "" when there is neither, and the app shows nothing for that release. Pure.
 */
export function whatsNewNotes(messages: readonly string[]): string {
  const bySection = new Map<string, string[]>();
  for (const message of [...messages].reverse()) {
    const header = (message.split("\n")[0] ?? "").trim();
    const match = HEADER.exec(header);
    const section = match ? WHATS_NEW[match[1]!.toLowerCase() as keyof typeof WHATS_NEW] : undefined;
    if (!section) continue;
    const subject = header.slice(match![0].length).trim();
    if (subject === "") continue;
    const line = `- ${subject[0]!.toUpperCase()}${subject.slice(1)}`;
    bySection.set(section, [...(bySection.get(section) ?? []), line]);
  }
  return [...new Set(Object.values(WHATS_NEW))]
    .filter((section) => bySection.has(section))
    .map((section) => `## ${section}\n\n${bySection.get(section)!.join("\n")}\n`)
    .join("\n");
}

/** The largest bump the messages ask for; patch when there are none. Pure. */
export function bumpAcross(messages: readonly string[]): Bump {
  return messages.reduce<Bump>((largest, message) => {
    const bump = bumpFor(message);
    return RANK[bump] > RANK[largest] ? bump : largest;
  }, "patch");
}

/** `current` advanced by what `messages` ask for. Throws on a non-semver current. Pure. */
export function nextVersion(current: string, messages: readonly string[]): string {
  const parts = /^(\d+)\.(\d+)\.(\d+)$/.exec(current.trim());
  if (!parts) throw new Error(`not a version: ${current}`);
  const [major, minor, patch] = parts.slice(1).map(Number) as [number, number, number];
  switch (bumpAcross(messages)) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * The version to release: `current` advanced by `messages`, or, for the first release (no v* tag yet), `current`
 * itself, so a repository starts at the version package.json was given. Pure.
 */
export function releaseVersion(current: string, messages: readonly string[], first: boolean): string {
  return first ? current.trim() : nextVersion(current, messages);
}

/** package.json with its version line rewritten, everything else byte for byte. Pure. */
export function withVersion(packageJson: string, version: string): string {
  const field = /^(\s*"version":\s*")[^"]*(")/m;
  if (!field.test(packageJson)) throw new Error("package.json has no version field");
  return packageJson.replace(field, `$1${version}$2`);
}

/** The commit messages since the last v* tag, or every commit when there is none: the first release ships them all. */
async function messagesSinceLastTag(): Promise<{ first: boolean; messages: string[] }> {
  const tag = (await $`git describe --tags --match "v*" --abbrev=0`.nothrow().quiet()).stdout.toString().trim();
  const log = await $`git log ${tag ? `${tag}..HEAD` : "HEAD"} --format=%B%x00`.quiet();
  const messages = log.stdout
    .toString()
    .split("\0")
    .map((message) => message.trim())
    .filter(Boolean);
  return { first: !tag, messages };
}

if (import.meta.main) {
  const path = new URL("../package.json", import.meta.url).pathname;
  const source = await Bun.file(path).text();
  const current = (JSON.parse(source) as { version?: string }).version ?? "0.0.0";
  const { first, messages } = await messagesSinceLastTag();
  const version = releaseVersion(current, messages, first);
  await Bun.write(path, withVersion(source, version));
  console.log(version);
  // Outside the repo, so the release step's `git commit -am` cannot pick it up.
  const notes = `${process.env.RUNNER_TEMP ?? "/tmp"}/release-notes.md`;
  await Bun.write(notes, releaseNotes(messages));
  // In the repo, so the build bundles it and the release step commits it.
  const whatsNew = whatsNewNotes(messages);
  if (whatsNew) await Bun.write(new URL(`../content/releases/${version}.md`, import.meta.url).pathname, whatsNew);
  const output = process.env.GITHUB_OUTPUT;
  if (output) await appendFile(output, `version=${version}\nnotes=${notes}\n`);
}
