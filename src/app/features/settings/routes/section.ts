import { createRoute, lazyRouteComponent, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { connectionsQuery } from "../../../../api/rpc/connections";
import { accessQuery } from "../../../../api/rpc/session";
import { isSection } from "../model/sections";
import { settings } from "./settings";

/** A section's search: a row to open at (`cover`, `work.partner`, `extra:babymoon`). */
const sectionSearch = z.object({ ask: z.string().optional().catch(undefined) });

/** One of Settings' sections: `/settings/work`, `/settings/account`; any other name is the first. */
export const section = createRoute({
  getParentRoute: () => settings,
  path: "$section",
  validateSearch: sectionSearch,
  beforeLoad: ({ params }) => {
    if (!isSection(params.section)) throw redirect({ to: "/settings", replace: true });
  },
  // Whether there is a way out to offer (with logins off, there is no logging out), and what Claude has connected.
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(accessQuery), queryClient.ensureQueryData(connectionsQuery)]),
  component: lazyRouteComponent(() => import("../pages/SettingsPage"), "SettingsPage"),
});
