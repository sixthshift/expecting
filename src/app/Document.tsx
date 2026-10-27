import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { THEME_BOOT_SCRIPT } from "../lib/theme";

/** The HTML document every page is drawn in. */
export function Document({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script below sets data-expecting-theme
    // before React hydrates, so <html> differs from the shell on purpose.
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string of our own, not user content */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="bg-(--expecting-page) text-fg-normal">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
