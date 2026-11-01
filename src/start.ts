// Start's instance: the middleware every request and every server function
// runs through. Imported on both sides; the middleware's server half is
// compiled out of the client.
import { createStart } from "@tanstack/react-start";
import { keptFunctionMiddleware } from "./app/model/kept";
import { authFunctionMiddleware, authMiddleware } from "./server/auth/middleware";
import { privateFunctionMiddleware } from "./server/privacy/middleware";

export const startInstance = createStart(() => ({
  requestMiddleware: [authMiddleware],
  // The gate, then nothing that names a private entry is saved (src/server/privacy/guard.ts).
  // In the browser, an answer the service worker kept is marked so (src/app/model/kept.ts).
  functionMiddleware: [keptFunctionMiddleware, authFunctionMiddleware, privateFunctionMiddleware],
}));
