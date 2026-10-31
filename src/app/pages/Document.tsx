import { ToastStack } from "@sixthshift/design-system/overlay";
import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { THEME_BOOT_SCRIPT } from "../../lib/theme";

/** The HTML document every page is drawn in. */
export function Document({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script below sets data-expecting-theme
    // and data-theme before React hydrates, so <html> differs from the shell on purpose.
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string of our own, not user content */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="bg-(--expecting-page) text-fg-normal">
        {children}
        {/* On a phone, above the tab bar and left of the "+", as wide as the room between them, so a toast reads in a line or two. */}
        <ToastStack className="bottom-[calc(4.5rem+env(safe-area-inset-bottom))] max-lg:right-20 max-lg:left-4 max-lg:translate-x-0 max-lg:items-stretch lg:bottom-6" />
        <Scripts />
      </body>
    </html>
  );
}
