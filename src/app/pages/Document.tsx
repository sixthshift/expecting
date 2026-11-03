import { ToastStack } from "@sixthshift/design-system/overlay";
import { HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { THEME_BOOT_SCRIPT } from "../../lib/theme";
import { LAYOUT_BOOT_SCRIPT } from "../model/layout";

/** The HTML document every page is drawn in. */
export function Document({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the boot scripts below set data-expecting-theme,
    // data-theme and data-layout before React hydrates, so <html> differs from the shell on purpose.
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string of our own, not user content */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string of our own, not user content */}
        <script dangerouslySetInnerHTML={{ __html: LAYOUT_BOOT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="bg-(--expecting-page) text-fg-normal">
        {children}
        {/* On a phone, above the tab bar and left of the "+", as wide as the room between them, so a toast reads in a line or two. */}
        <ToastStack className="bottom-[calc(4.5rem+env(safe-area-inset-bottom))] phone:right-20 phone:left-4 phone:translate-x-0 phone:items-stretch desktop:bottom-6" />
        <Scripts />
      </body>
    </html>
  );
}
