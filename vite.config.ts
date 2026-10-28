import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { rootRoute } from "@tanstack/virtual-file-routes";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vitest/config";

// nitro is the deploy adapter (dev server + .output build). Under vitest it
// combines with tanstackStart to inline React's CJS build into the module
// runner ("module is not defined"), so it is left out of the test config.
const testing = Boolean(process.env.VITEST);

// package.json's version, bumped on every push to main by the release workflow
// and inlined into both bundles as __EXPECTING_VERSION__ (src/lib/version.ts).
const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

// The commit, inlined as __EXPECTING_COMMIT__ beside it: EXPECTING_COMMIT when the
// build is handed one (the image's build context has no .git, so the workflow
// passes it as a build argument), else git's own answer, else "" — a build
// outside a checkout still builds.
function commit(): string {
  const given = process.env.EXPECTING_COMMIT?.trim();
  if (given) return given.slice(0, 7);
  try {
    return execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

export default defineConfig({
  define: { __EXPECTING_VERSION__: JSON.stringify(version), __EXPECTING_COMMIT__: JSON.stringify(commit()) },
  // 9966 is expecting's port everywhere — dev, `bun run start` and the image.
  // strictPort fails loud rather than hopping to a port the devcontainer does
  // not publish.
  server: { port: 9966, strictPort: true },
  plugins: [
    tanstackStart({
      spa: { enabled: true },
      // Server functions answer under /api/rpc/, beside the /api/* server
      // routes: src/api/ is everything that answers at /api.
      serverFns: { base: "/api/rpc" },
      // Routing is code: src/routes/routes.ts builds the tree with createRoute.
      // Start still runs its route generator to build the asset manifest, so
      // it is handed the root alone and an output path nothing imports.
      router: { virtualRouteConfig: rootRoute("root.tsx"), generatedRouteTree: "../.tanstack/routeTree.gen.ts" },
    }),
    // compressPublicAssets writes .gz/.br beside each built asset; Nitro's static handler serves them by Accept-Encoding.
    ...(testing ? [] : [nitro({ preset: "bun", compressPublicAssets: { gzip: true, brotli: true } })]),
    viteReact(),
    tailwindcss(),
  ],
  test: {
    // Off: the persistent transform cache keys on a module's own source, so
    // src/content/index.ts keeps an old import.meta.glob result when files are
    // added to content/, and a new or broken item would pass the gate unseen.
    // The suite is fast enough not to need it.
    fsModuleCache: false,
    // Two projects, told apart by file name. Everything is node — pure logic,
    // repositories, server functions, and components through `renderToString`
    // — except `*.dom.test.tsx`, which gets happy-dom and Testing Library so an
    // interaction can be driven rather than read. A DOM for every file would
    // cost every file.
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          include: ["test/**/*.test.{ts,tsx}"],
          exclude: ["test/**/*.dom.test.tsx"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          include: ["test/**/*.dom.test.tsx"],
          environment: "happy-dom",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
