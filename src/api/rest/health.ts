import { createRoute } from "@tanstack/react-router";
import { COMMIT, VERSION } from "../../lib/version";
import { rootRoute } from "../../routes/root";

/** GET /api/health — liveness probe for outside callers, and what version and commit answered. */
export const healthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/health",
  server: {
    handlers: {
      GET: () => Response.json({ ok: true, version: VERSION, commit: COMMIT }),
    },
  },
});
