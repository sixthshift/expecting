/**
 * How one page gives way to the next (the View Transitions API, through the
 * router's `defaultViewTransition`; src/styles/transitions.css draws them).
 *
 *   in      deeper, to a page under this one (a Library entry, a list, the book): it slides in from the side
 *   out     back up to the page above: the reverse
 *   across  to another pillar, or a page beside this one: a short fade
 *
 * Only when the path changes: a change of the search alone (the timeline's
 * week, the Journal's lens) is the same page answering, and has no transition.
 * Nor onboarding and login: plain pages, reached through redirects one after
 * another, where a transition would only be cut short by the next.
 * A browser without view transitions just changes page, as before.
 */
export type PageTransition = "in" | "out" | "across";

/** The plain pages, outside the frame: no transitions to, from or between them. */
const PLAIN = ["/onboarding", "/login"];

/** The steps of a path: `/library/glucose-tolerance-test` is two, `/` none. */
function steps(path: string): string[] {
  return path.split("/").filter(Boolean);
}

/** How the page at `from` gives way to the page at `to`, or `false` for none. */
export function transitionBetween(from: string | undefined, to: string, pathChanged: boolean): [PageTransition] | false {
  if (from === undefined || !pathChanged) return false;
  if ([from, to].some((path) => PLAIN.some((plain) => path === plain || path.startsWith(`${plain}/`)))) return false;
  const a = steps(from);
  const b = steps(to);
  const under = (outer: string[], inner: string[]) => inner.length > outer.length && outer.every((step, i) => inner[i] === step);
  // Home is `/`, but This week's pages are no deeper than a pillar: only a shared first step counts as under.
  if (a.length > 0 && under(a, b)) return ["in"];
  if (b.length > 0 && under(b, a)) return ["out"];
  return ["across"];
}

/**
 * A page change that starts while another is still moving skips the first
 * one's animation, and its `ready` promise rejects ("Transition was
 * skipped"). That's expected, not an error, but the router drops those
 * promises, so the rejection would surface as one. Wrap the browser's
 * `startViewTransition` once, so each transition's promises are handled.
 */
export function quietSkippedTransitions(): void {
  if (typeof document === "undefined" || typeof document.startViewTransition !== "function") return;
  const start = document.startViewTransition.bind(document) as (arg?: unknown) => ViewTransition;
  if ((start as { quiet?: boolean }).quiet) return;
  const quiet = (arg?: unknown) => {
    const transition = start(arg);
    transition.ready.catch(() => undefined);
    transition.finished.catch(() => undefined);
    return transition;
  };
  document.startViewTransition = Object.assign(quiet, { quiet: true }) as typeof document.startViewTransition;
}
