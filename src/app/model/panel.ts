import { z } from "zod";

/**
 * What the desktop's side panel shows by its address: `?panel=item:<id>`, a
 * Library entry beside the page you're on. In the address so Back closes it
 * and a link to it opens it; on any page, so it's the app's (the `app`
 * route's search). Never a private entry, whose address never reaches the
 * address bar: its link goes to its own page, as on a phone.
 */
export const panelSearch = z.object({
  panel: z
    .string()
    .regex(/^item:[a-z0-9-]+$/)
    .optional()
    .catch(undefined),
});

/** The address's panel for an entry: `item:rsv-vaccine`. */
export function itemPanel(itemId: string): string {
  return `item:${itemId}`;
}

/** The entry an address's panel names, if it names one. */
export function panelItem(panel: string | undefined): string | null {
  return panel?.startsWith("item:") ? panel.slice("item:".length) : null;
}
