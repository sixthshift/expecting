import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { outboxCaches, queueSaves } from "./app/model/outbox";
import { transitionBetween } from "./app/model/transitions";
import { PageSkeleton } from "./components/loading/Skeleton";
import { isLoggedOut } from "./lib/errors";
import { routeTree } from "./routes/tree";

export function getRouter() {
  const queryClient: QueryClient = new QueryClient({
    // Every save goes through the outbox, and is shown over what's fetched until it's sent.
    ...outboxCaches(() => queryClient),
    defaultOptions: {
      queries: {
        // Fresh for half a minute: moving between pillars doesn't refetch, and a phone
        // coming back to the app (window focus) picks up what the other one changed.
        staleTime: 30_000,
        // Ask even when the phone says it's offline: the service worker answers with the last answer it kept
        // (src/pwa/worker.js). "online", the default, would wait for a connection, and a page would never draw.
        networkMode: "offlineFirst",
        // Once more after a failure, unless the session has ended: no point asking again.
        retry: (count, error) => count < 1 && !isLoggedOut(error),
      },
      // What isn't a save (logging in, who's holding the phone, onboarding's finish) fails at once with no
      // connection, and says so (useAction's toast). A save waits for one (queueSaves).
      mutations: { networkMode: "always" },
    },
  });
  queueSaves(queryClient);

  return createRouter({
    routeTree,
    // The loaders' way to the queries (each beside its server functions, in src/api/rpc/).
    context: { queryClient },
    Wrap: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    // Off: the timeline decides where it opens (this week, or ?at=), and a
    // restored position would fight it.
    scrollRestoration: false,
    defaultPreload: "intent",
    // A page whose data or code is slow draws its shape in its place, in the frame: not for a quick load
    // (under 400ms, so it doesn't flash), and once shown, for at least the router's half a second. The
    // app's first start, before there's a frame, has the stork (routes/app.tsx, onboarding, login).
    defaultPendingComponent: PageSkeleton,
    defaultPendingMs: 400,
    // Pages give way to each other: in and out for a page under another, a fade across pillars (src/styles/transitions.css).
    defaultViewTransition: {
      types: ({ fromLocation, toLocation, pathChanged }) => transitionBetween(fromLocation?.pathname, toLocation.pathname, pathChanged),
    },
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

// What a page keeps in its history entry: a private entry's page marks its address masked (LibraryItemPage).
declare module "@tanstack/history" {
  interface HistoryState {
    masked?: boolean;
  }
}
