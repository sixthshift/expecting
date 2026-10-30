// The e2e project: the production build, served the way the image serves it,
// driven by a real browser. vitest proves the parts; this proves they were
// assembled — a client bundle that throws as it loads passes every vitest file
// and fails here.
//
// One server, one database, one worker: every spec shares the database.
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// Not 9966: that is the dev server's, and it is strictPort.
const PORT = 9967;

// A fixed path, emptied by the command, so a failed run's database is still
// there to open afterwards.
export const DATA_DIR = join(tmpdir(), "expecting-e2e");

// The household password the specs log in with, chosen by global-setup.ts on
// the empty database's first visit. A test-only secret: it guards an empty
// temp database and nothing else.
export const PASSWORD = "e2e-household-password";

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  // After the server is up, before any spec: the first visit, which chooses the password.
  globalSetup: "./global-setup.ts",
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "../playwright-report" }]] : "list",
  outputDir: "../test-results",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // Adaptive: a phone's bottom tab bar and a desktop's side rail are different
  // layouts, so every page loads in both. The journey runs once, on the phone,
  // because it starts from the empty database and leaves it filled.
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testMatch: "smoke.spec.ts", dependencies: ["phone"] },
  ],
  webServer: {
    // --no-env-file: Bun would otherwise load the developer's .env into the server under test.
    command: `rm -rf ${DATA_DIR} && mkdir -p ${DATA_DIR} && bun run build && bun --no-env-file run .output/server/index.mjs`,
    cwd: "..",
    url: `http://localhost:${PORT}/api/health`,
    // Never another server: one already running has a database these specs did not make.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PORT: String(PORT), DATA_DIR },
    stdout: "ignore",
    stderr: "pipe",
  },
});
