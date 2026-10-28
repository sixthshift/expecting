// Start's instance: the middleware every request and every server function
// runs through. Imported on both sides; the middleware's server half is
// compiled out of the client.
import { createStart } from "@tanstack/react-start";
import { authFunctionMiddleware, authMiddleware } from "./server/auth/middleware";

export const startInstance = createStart(() => ({
  requestMiddleware: [authMiddleware],
  functionMiddleware: [authFunctionMiddleware],
}));
