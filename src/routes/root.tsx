import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { Document } from "../app/pages/Document";
import { ErrorPage } from "../app/pages/ErrorPage";
import { NotFound } from "../app/pages/NotFound";
import { Root } from "../app/pages/Root";
import appCss from "../styles/index.css?url";

/** What every loader is handed: the queries, which hold what the app has loaded. */
export type RouterContext = { queryClient: QueryClient };

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Expecting" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { title: "Expecting" },
    ],
    // The icons and the manifest are public/: served as files ahead of the app, so the login page has them too.
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: Document,
  // This phone's mode, then each page brings its own frame: the app's pillars
  // theirs, onboarding and login a plain page.
  component: Root,
  notFoundComponent: NotFound,
  errorComponent: ErrorPage,
});
