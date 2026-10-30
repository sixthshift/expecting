import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../routes/root";
import { serveFile } from "../../server/files/serve";

/**
 * GET /api/files/<id>/<variant>: an upload's part (original, display or
 * thumb), for an `<img>` or a download. The one server route the app itself
 * calls, on purpose: an `<img>` needs a plain URL it can GET, and a server
 * function is a POST to a generated id that answers in its own encoding.
 * Behind the gate like every /api/* path: no session, a 401.
 */
export const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/api/files/$id/$variant",
  server: {
    handlers: {
      GET: ({ request, params }) => serveFile(request, params),
    },
  },
});
