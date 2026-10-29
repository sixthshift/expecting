import { createRouter } from "@tanstack/react-router";
import { LoadingPage } from "./components/loading/Loading";
import { routeTree } from "./routes/tree";

export function getRouter() {
  return createRouter({
    routeTree,
    // Off: the timeline decides where it opens (this week, or ?at=), and a
    // restored position would fight it.
    scrollRestoration: false,
    defaultPreload: "intent",
    // A reload of data already shown (router.invalidate, after every save) is waited for, not run in the
    // background: what's awaited is the fresh data, so a navigation straight after a save (onboarding's next
    // question) draws what was just saved, and useAction's pending lasts until the page shows it.
    defaultStaleReloadMode: "blocking",
    // A page whose data is slow draws the loading animation in its place: not for a quick load (under
    // 400ms, so it doesn't flash), and once shown, for at least the router's half a second.
    defaultPendingComponent: LoadingPage,
    defaultPendingMs: 400,
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
