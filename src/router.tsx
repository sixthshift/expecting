import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routes/tree";

export function getRouter() {
  return createRouter({
    routeTree,
    // Off: the timeline decides where it opens (this week, or ?at=), and a
    // restored position would fight it.
    scrollRestoration: false,
    defaultPreload: "intent",
  });
}

// Type registration: gives Link, useNavigate and the hooks the tree's paths and search types.
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

declare module "@tanstack/react-start" {
  interface Register {
    ssr: true;
    router: ReturnType<typeof getRouter>;
  }
}
