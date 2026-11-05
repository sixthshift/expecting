// .github/workflows/docker.yml is text, so its contract is asserted here: the
// image is built from docker/Dockerfile a half per platform, each on a runner
// of its own kind (arm64 natively, not under emulation), joined into one
// image published to ghcr.io on pushes and not on pull requests, gated by the
// test and e2e jobs, all on the Bun the image is pinned to. Actions itself is
// not run here.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { fromImage, instructions } from "./dockerfile.test";

const root = join(import.meta.dirname, "..", "..");
const workflow = Bun.YAML.parse(readFileSync(join(root, ".github", "workflows", "docker.yml"), "utf8")) as Workflow;
const dockerfile = readFileSync(join(root, "docker", "Dockerfile"), "utf8");

type Step = {
  uses?: string;
  run?: string;
  id?: string;
  name?: string;
  if?: string;
  env?: Record<string, string>;
  with?: Record<string, string | number | boolean>;
};
type Job = {
  needs?: string | string[];
  if?: string;
  "runs-on"?: string;
  "timeout-minutes"?: number;
  permissions?: Record<string, string>;
  strategy?: { "fail-fast"?: boolean; matrix?: { include?: Record<string, string>[] } };
  steps: Step[];
};
type Workflow = {
  on: { push?: { branches?: string[]; tags?: string[] }; pull_request?: unknown };
  permissions?: Record<string, string>;
  concurrency?: { group?: string; "cancel-in-progress"?: boolean };
  jobs: Record<string, Job>;
};

/** The step whose `uses` starts with `action`, or undefined. Pure. */
export function stepUsing(steps: readonly Step[], action: string): Step | undefined {
  return steps.find((step) => step.uses?.startsWith(action));
}

const { test: testJob, e2e, build: halves, image } = workflow.jobs;
const build = stepUsing(halves!.steps, "docker/build-push-action")!;
const halfBump = halves!.steps.find((step) => step.id === "bump")!;
const meta = stepUsing(image!.steps, "docker/metadata-action")!;
const bump = image!.steps.find((step) => step.id === "bump")!;
const joined = image!.steps.find((step) => step.id === "join")!;
const record = image!.steps.find((step) => step.name?.startsWith("commit the version"))!;
const release = image!.steps.find((step) => step.name === "publish the release")!;
const pinned = () => fromImage(instructions(dockerfile).find((line) => /^FROM\s/i.test(line))!).split(":")[1];

describe("triggers", () => {
  test("runs on pushes to main and v* tags, and on pull requests", () => {
    expect(workflow.on.push?.branches).toEqual(["main"]);
    expect(workflow.on.push?.tags).toEqual(["v*"]);
    expect(workflow.on.pull_request).toBeDefined();
  });

  test("may write packages", () => {
    expect(workflow.permissions?.packages).toBe("write");
  });
});

// Actions' default is six hours; a hung build would hold main's queue that long.
test("every job has a time limit", () => {
  for (const [name, job] of Object.entries(workflow.jobs)) expect(job["timeout-minutes"], name).toBeGreaterThan(0);
});

describe("test job", () => {
  test("installs from the lockfile, typechecks, tests and lints", () => {
    const runs = testJob!.steps.map((step) => step.run).filter(Boolean);
    expect(runs).toEqual(["bun install --frozen-lockfile", "bun run check", "bun run test", "bun run lint"]);
  });

  test("runs the Bun the image is pinned to", () => {
    expect(stepUsing(testJob!.steps, "oven-sh/setup-bun")?.with?.["bun-version"]).toBe(pinned());
  });
});

// The built app in a real browser, beside the vitest gate rather than after it.
describe("e2e job", () => {
  test("installs from the lockfile and Chromium with its system libraries, then runs the e2e specs", () => {
    const runs = e2e!.steps.map((step) => step.run).filter(Boolean);
    expect(runs).toEqual(["bun install --frozen-lockfile", "bunx playwright install --with-deps chromium", "bun run e2e"]);
  });

  test("runs the Bun the image is pinned to", () => {
    expect(stepUsing(e2e!.steps, "oven-sh/setup-bun")?.with?.["bun-version"]).toBe(pinned());
  });

  test("keeps the report and traces when it fails", () => {
    const upload = stepUsing(e2e!.steps, "actions/upload-artifact")!;
    expect(upload.if).toBe("failure()");
    expect(upload.with?.path).toContain("playwright-report");
    expect(upload.with?.path).toContain("test-results");
  });
});

describe("build job: a half per platform", () => {
  test("waits for the tests and the e2e specs", () => {
    expect(halves!.needs).toEqual(["test", "e2e"]);
  });

  test("amd64 on ubuntu-latest and arm64 on GitHub's arm runner: each native, none emulated", () => {
    expect(halves!.strategy?.matrix?.include).toEqual([
      { platform: "linux/amd64", arch: "amd64", runner: "ubuntu-latest" },
      { platform: "linux/arm64", arch: "arm64", runner: "ubuntu-24.04-arm" },
    ]);
    expect(halves!["runs-on"]).toBe("${{ matrix.runner }}");
    expect(stepUsing(halves!.steps, "docker/setup-qemu-action")).toBeUndefined();
  });

  test("builds docker/Dockerfile from the repo root for its own platform, with a cache of its own", () => {
    expect(build.with?.context).toBe(".");
    expect(build.with?.file).toBe("docker/Dockerfile");
    expect(build.with?.platforms).toBe("${{ matrix.platform }}");
    expect(build.with?.["cache-from"]).toBe("type=gha,scope=${{ matrix.arch }}");
    expect(build.with?.["cache-to"]).toBe("type=gha,mode=max,scope=${{ matrix.arch }}");
  });

  test("pushes its half by digest, untagged, except for pull requests, and hands the digest on", () => {
    expect(build.with?.outputs).toContain("name=ghcr.io/${{ github.repository }}");
    expect(build.with?.outputs).toContain("push-by-digest=true");
    expect(build.with?.outputs).toContain("push=${{ github.event_name != 'pull_request' }}");
    expect(build.with?.tags).toBeUndefined();
    const upload = stepUsing(halves!.steps, "actions/upload-artifact")!;
    expect(upload.with?.name).toBe("digests-${{ matrix.arch }}");
    expect(upload.if).toBe("github.event_name != 'pull_request'");
  });

  test("runs on the Bun the image is pinned to", () => {
    expect(stepUsing(halves!.steps, "oven-sh/setup-bun")?.with?.["bun-version"]).toBe(pinned());
  });
});

describe("image job: the halves joined", () => {
  test("waits for both halves, and doesn't run for a pull request", () => {
    expect(image!.needs).toEqual(["build"]);
    expect(image!.if).toBe("github.event_name != 'pull_request'");
  });

  test("joins every half's digest under the tags, rebuilding nothing", () => {
    expect(stepUsing(image!.steps, "actions/download-artifact")?.with?.pattern).toBe("digests-*");
    expect(joined.run).toContain("docker buildx imagetools create");
    expect(joined.run).toContain("$DOCKER_METADATA_OUTPUT_JSON");
    expect(stepUsing(image!.steps, "docker/build-push-action")).toBeUndefined();
  });

  test("publishes to ghcr.io under the repository's name, latest on main", () => {
    expect(meta.with?.images).toBe("ghcr.io/${{ github.repository }}");
    expect(meta.with?.tags).toContain("type=raw,value=latest,enable={{is_default_branch}}");
    expect(joined.env?.IMAGE).toBe("ghcr.io/${{ github.repository }}");
  });
});

// The version is bumped before each half is built so the image carries it
// (worked out from the commits, so the same in every job), and the commit and
// tag are written after the halves are joined, so a version is only spent on
// an image that published. scripts/version.ts owns the size of the bump.
describe("version bump", () => {
  test("runs the bumper in each half and in the image job, on a push to main only", () => {
    for (const step of [halfBump, bump]) {
      expect(step.run).toBe("bun run version:next");
      expect(step.if).toBe("github.event_name == 'push' && github.ref == 'refs/heads/main'");
    }
  });

  test("bumps before each half is built, and commits after they're joined", () => {
    expect(halves!.steps.indexOf(halfBump)).toBeLessThan(halves!.steps.indexOf(build));
    const order = image!.steps.indexOf.bind(image!.steps);
    expect(order(bump)).toBeLessThan(order(joined));
    expect(order(record)).toBeGreaterThan(order(joined));
  });

  test("checks out the whole history, since the bumper reads the commits since the last tag", () => {
    for (const job of [halves!, image!]) expect(stepUsing(job.steps, "actions/checkout")?.with?.["fetch-depth"]).toBe(0);
  });

  test("runs the bumper on the Bun the image is pinned to", () => {
    expect(stepUsing(image!.steps, "oven-sh/setup-bun")?.with?.["bun-version"]).toBe(pinned());
  });

  test("tags the image with the new version as well as latest, and labels each half with it", () => {
    // priority=1000 outranks latest's default 200, so org.opencontainers.image.version is the number, not "latest".
    const version = "type=raw,value=${{ steps.bump.outputs.version }},priority=1000,enable=${{ steps.bump.outputs.version != '' }}";
    expect(meta.with?.tags).toContain(version);
    expect(stepUsing(halves!.steps, "docker/metadata-action")?.with?.tags).toContain(version);
    expect(build.with?.labels).toBe("${{ steps.meta.outputs.labels }}");
  });

  test("writes the commit and its v tag back to main, skipping CI so it does not loop", () => {
    expect(record.if).toBe("steps.bump.outputs.version != ''");
    expect(record.run).toContain("[skip ci]");
    // The release notes are a new file, so -a alone would leave them behind.
    expect(record.run).toContain("git add package.json content/releases");
    // The first release changes nothing: commit only what changed, so it still tags.
    expect(record.run).toContain("git diff --cached --quiet || git commit -m");
    // Annotated and named on the push: a lightweight tag is not pushed by
    // --follow-tags, which is how v1.0.1 shipped an image but no tag.
    expect(record.run).toContain('git tag -a "v$VERSION"');
    expect(record.run).toContain('git push origin HEAD:main "refs/tags/v$VERSION"');
  });

  test("publishes the tag as a release, with notes written from the commits", () => {
    expect(release.if).toBe("steps.bump.outputs.version != ''");
    expect(release.run).toContain('gh release create "v$VERSION"');
    expect(release.env?.NOTES).toBe("${{ steps.bump.outputs.notes }}");
    expect(release.run).toContain('--notes-file "$NOTES"');
    expect(release.run).toContain("--generate-notes");
    expect(release.env?.GH_TOKEN).toBe("${{ secrets.GITHUB_TOKEN }}");
    expect(image!.steps.indexOf(release)).toBeGreaterThan(image!.steps.indexOf(record));
  });

  test("may write to the repository, and only one release runs at a time", () => {
    expect(image!.permissions?.contents).toBe("write");
    expect(workflow.concurrency?.group).toBe("docker-${{ github.ref }}");
    expect(workflow.concurrency?.["cancel-in-progress"]).toBe(false);
  });
});
