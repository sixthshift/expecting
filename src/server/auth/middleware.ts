import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { gate, refuseFunction } from "./gate";

/** Every request passes the gate first: pages and /api/* by path. */
export const authMiddleware = createMiddleware().server(({ request, next }) => gate(request) ?? next());

/** Every server function then passes it by the file it is defined in. */
export const authFunctionMiddleware = createMiddleware({ type: "function" }).server(({ serverFnMeta, next }) => {
  const refused = refuseFunction(getRequest(), serverFnMeta.filename);
  if (refused) throw refused;
  return next();
});
