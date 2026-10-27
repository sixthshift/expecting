import { Route as home } from "./home/route";
import { Route as login } from "./login/route";
import { Route as root } from "./root";
import { Route as settings } from "./settings/route";

// /api/* is served by the server alone: its handlers may import the store, and
// the browser never routes there, it fetches. Vite fixes import.meta.env.SSR
// at build time, so the client bundle drops this branch and the modules
// behind it. The type stays the full list so both sides see one tree.
const api = import.meta.env.SSR ? (await import("./api/routes")).apiRoutes : ([] as unknown as typeof import("./api/routes").apiRoutes);

export const routeTree = root.addChildren([home, login, settings, ...api]);
