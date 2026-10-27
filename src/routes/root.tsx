import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Document } from "../app/Document";
import { NotFound } from "../app/NotFound";
import appCss from "../styles.css?url";

export const rootRoute = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { title: "Expecting" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: Document,
  // Each page brings its own frame: the app's pillars theirs, onboarding and login a plain page.
  component: Outlet,
  notFoundComponent: NotFound,
});
