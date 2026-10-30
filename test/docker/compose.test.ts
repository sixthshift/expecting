// docker/docker-compose.yml is text, so its contract is asserted here: one
// `expecting` service pulling the published image, on port 9966 with the host
// data folder (EXPECTING_DATA_DIR, default ./data) bind-mounted at
// DATA_DIR=/data, and logins on unless EXPECTING_LOGIN says off. Docker
// itself is not run under vitest.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = join(import.meta.dirname, "..", "..");
const composeText = readFileSync(join(root, "docker", "docker-compose.yml"), "utf8");
const dockerfile = readFileSync(join(root, "docker", "Dockerfile"), "utf8");

type Compose = {
  version?: unknown;
  services: Record<
    string,
    {
      build?: unknown;
      image?: string;
      ports?: string[];
      volumes?: string[];
      environment?: Record<string, string> | string[];
      restart?: string;
    }
  >;
  volumes?: Record<string, unknown>;
};

/** Parse the compose file with Bun's YAML parser. Pure. */
export function parseCompose(text: string): Compose {
  return Bun.YAML.parse(text) as Compose;
}

/** `key` from either the map or the list form of `environment`. Pure. */
export function envValue(environment: Compose["services"][string]["environment"], key: string): string | undefined {
  if (!environment) return undefined;
  if (Array.isArray(environment)) {
    const hit = environment.find((entry) => entry.startsWith(`${key}=`));
    return hit?.slice(key.length + 1);
  }
  return environment[key];
}

const compose = parseCompose(composeText);
const expecting = compose.services.expecting!;

describe("compose file", () => {
  test("has no version key and exactly one service, expecting", () => {
    expect(compose.version).toBeUndefined();
    expect(Object.keys(compose.services)).toEqual(["expecting"]);
  });

  test("pulls the published image, overridable for a local build, and builds nothing", () => {
    expect(expecting.image).toBe("${EXPECTING_IMAGE:-ghcr.io/sixthshift/expecting:latest}");
    expect(expecting.build).toBeUndefined();
  });

  test("publishes 9966, the Dockerfile's EXPOSE", () => {
    expect(expecting.ports).toEqual(["9966:9966"]);
    expect(dockerfile).toMatch(/^EXPOSE\s+9966$/m);
  });

  test("bind-mounts the host data folder at /data, ./data unless EXPECTING_DATA_DIR says otherwise", () => {
    expect(expecting.volumes).toEqual(["${EXPECTING_DATA_DIR:-./data}:/data"]);
    expect(compose.volumes).toBeUndefined();
  });

  test("DATA_DIR points at the mount", () => {
    expect(envValue(expecting.environment, "DATA_DIR")).toBe("/data");
  });

  test("logins are on unless the host turns them off; the password itself is chosen in the app", () => {
    expect(expecting.environment).toEqual({ DATA_DIR: "/data", EXPECTING_LOGIN: "${EXPECTING_LOGIN:-on}" });
  });

  test("restarts unless stopped", () => {
    expect(expecting.restart).toBe("unless-stopped");
  });
});

describe("envValue", () => {
  test("reads the list form too", () => {
    expect(envValue(["DATA_DIR=/x", "PORT=1"], "DATA_DIR")).toBe("/x");
    expect(envValue(["PORT=1"], "DATA_DIR")).toBeUndefined();
    expect(envValue(undefined, "DATA_DIR")).toBeUndefined();
  });
});
