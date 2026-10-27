import { createMiddleware } from "@tanstack/react-start";
import { gate } from "./gate";

/** Every request, pages and server functions alike, passes the gate first. */
export const authMiddleware = createMiddleware().server(({ request, next }) => gate(request) ?? next());
