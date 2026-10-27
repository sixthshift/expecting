import { createRootRoute, HeadContent, Link, Outlet, Scripts, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Page } from "../components/Page";
import { TabBar } from "../components/TabBar";
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
  component: AppLayout,
  notFoundComponent: NotFound,
});

function AppLayout() {
  const { pathname } = useLocation();
  if (pathname === "/login") return <Outlet />;
  return (
    <>
      {/* From lg the navigation is a 14rem rail on the left; the page sits beside it. */}
      <div className="lg:pl-56">
        <Outlet />
      </div>
      <TabBar />
    </>
  );
}

function NotFound() {
  return (
    <Page title="Not here">
      <p>
        There's no page at this address.{" "}
        <Link to="/" className="underline">
          Back to this week
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
