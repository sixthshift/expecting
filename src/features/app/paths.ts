import type { ToOptions } from "@tanstack/react-router";

/** A path in the route tree, as `Link` and `navigate` take it. */
export type AppPath = NonNullable<ToOptions["to"]>;
