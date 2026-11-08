import { createRoute, redirect } from "@tanstack/react-router";
import { sectionOf } from "../model/sections";
import { askSearch } from "./section";
import { settings } from "./settings";

/** `/settings` is its first section; `?ask=cover` (a question, `extra:babymoon`, `quiet`) is the section that has it, opened at it. */
export const settingsIndex = createRoute({
  getParentRoute: () => settings,
  path: "/",
  validateSearch: askSearch,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/settings/$section", params: { section: sectionOf(search.ask) }, search: { ask: search.ask }, replace: true });
  },
});
