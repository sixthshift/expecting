// The README's screenshots (`bun run screenshots`): the production build over
// an empty database of its own, filled through the UI as Sam and Jason would,
// then photographed. Not part of the gate: run it when the look changes, and
// commit the pictures in docs/screenshots/.
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

// Not 9966 (the dev server) nor 9967–9998 (e2e), so it runs beside either.
const PORT = 9965;
const DATA_DIR = join(tmpdir(), "expecting-screenshots");

export default defineConfig({
  testDir: ".",
  testMatch: "shots.ts",
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "../../test-results/screenshots",
  timeout: 120_000,
  use: { baseURL: `http://localhost:${PORT}`, colorScheme: "light", locale: "en-AU", timezoneId: "Australia/Sydney" },
  webServer: {
    // --no-env-file: Bun would otherwise load the developer's .env into the server.
    command: `rm -rf ${DATA_DIR} && mkdir -p ${DATA_DIR} && bun run build && bun --no-env-file run .output/server/index.mjs`,
    cwd: "../..",
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { PORT: String(PORT), DATA_DIR, TZ: "Australia/Sydney" },
    stdout: "ignore",
    stderr: "pipe",
  },
});
