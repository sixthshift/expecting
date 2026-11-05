import { section } from "./section";
import { settings } from "./settings";
import { settingsIndex } from "./settingsIndex";

/** Settings' addresses: `/settings`, its first section, and each section a page (`/settings/<section>`). */
export const settingsRoutes = settings.addChildren([settingsIndex, section]);
