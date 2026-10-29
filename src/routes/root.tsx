import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Document } from "../features/app/Document";
import { ErrorPage } from "../features/app/ErrorPage";
import { NotFound } from "../features/app/NotFound";
import appCss from "../styles/index.css?url";

/** What every loader is handed: the queries, which hold what the app has loaded. */
export type RouterContext = { queryClient: QueryClient };

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { title: "Expecting" },
    ],
    // The icons are public/: served as files ahead of the app, so the login page has them too.
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: Document,
  // Each page brings its own frame: the app's pillars theirs, onboarding and login a plain page.
  component: Outlet,
  notFoundComponent: NotFound,
  errorComponent: ErrorPage,
});
