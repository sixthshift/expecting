import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { LoadingPage } from "./components/loading/Loading";
import { isLoggedOut } from "./lib/errors";
import { routeTree } from "./routes/tree";

export function getRouter() {
  const queryClient = new QueryClient({
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
      // A save with no connection fails at once and says so (useAction's toast), rather than wait, its
      // spinner turning, for the connection to come back. Nothing queues it yet.
      mutations: { networkMode: "always" },
    },
  });

  return createRouter({
    routeTree,
    // The loaders' way to the queries (each beside its server functions, in src/api/rpc/).
    context: { queryClient },
    Wrap: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    // Off: the timeline decides where it opens (this week, or ?at=), and a
    // restored position would fight it.
    scrollRestoration: false,
    defaultPreload: "intent",
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

// What a page keeps in its history entry: a private entry's page marks its address masked (LibraryItemPage).
declare module "@tanstack/history" {
  interface HistoryState {
    masked?: boolean;
  }
}
