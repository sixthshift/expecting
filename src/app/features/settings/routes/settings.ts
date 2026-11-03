import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { z } from "zod";
import { connectionsQuery } from "../../../../api/rpc/connections";
import { accessQuery } from "../../../../api/rpc/session";
import { app } from "../../../../routes/app";

/** Settings' search: a question to open at (`cover`, `work.partner`). */
const settingsSearch = z.object({ ask: z.string().optional().catch(undefined) });

/** Settings: your answers, the colours and this phone; `?ask=cover` opens at a question. */
export const settings = createRoute({
  getParentRoute: () => app,
  path: "settings",
  validateSearch: settingsSearch,
  // Whether there is a way out to offer (with logins off, there is no logging out), and what Claude has connected.
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(accessQuery), queryClient.ensureQueryData(connectionsQuery)]),
  component: lazyRouteComponent(() => import("../pages/SettingsPage"), "SettingsPage"),
});
