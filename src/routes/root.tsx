import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Page } from "../components/Page";
import { THEME_BOOT_SCRIPT } from "../lib/theme";
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
    // suppressHydrationWarning: the boot script below sets data-expecting-theme
    // before React hydrates, so <html> differs from the shell on purpose.
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string of our own, not user content */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="bg-bg-subtle text-fg-normal">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
