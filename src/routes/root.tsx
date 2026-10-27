import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Page } from "../components/Page";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { title: "Expecting" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  // Each page brings its own frame: the timeline its rail and scrubber, the rest a plain page.
  component: Outlet,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <Page title="Not here">
      <p>
        There's no page at this address.{" "}
        <Link to="/" className="underline">
          Back to the timeline
        </Link>
        .
      </p>
    </Page>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg-subtle text-fg-normal">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
