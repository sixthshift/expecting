import type { RouteComponent } from "@tanstack/react-router";
import { useQuietKind } from "./hooks/useQuietKind";

/**
 * A route's page in both worlds: `normal`, or `quiet` while something has
 * happened. Each is a route's own component, in practice two
 * `lazyRouteComponent`s, so the route's file says which page each world draws
 * and pages never choose. The address is the same in both. Quiet is read from
 * the cache the app's loader filled, so the choice never waits; when it
 * changes, the other world's page is swapped in, in place.
 */
export function worlds(normal: RouteComponent, quiet: RouteComponent): RouteComponent {
  function Worlds() {
    const Page = useQuietKind() ? quiet : normal;
    return <Page />;
  }
  // The router preloads on intent; which world isn't known without the cache, so both are fetched.
  Worlds.preload = async () => {
    await Promise.all([normal.preload?.(), quiet.preload?.()]);
  };
  return Worlds;
}
