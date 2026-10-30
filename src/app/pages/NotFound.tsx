import { Button } from "@sixthshift/design-system/button";
import { Link, useLocation } from "@tanstack/react-router";
import { NothingHere } from "../../components/NothingHere";
import { LookFor } from "../../features/library/components/lookFor/LookFor";
import { cluesIn } from "../../lib/library";

/**
 * An address in the app with no page: still in the frame, with the pillars
 * where they always are. Most likely an old or cut-short link to an entry, so
 * it searches the Library for the address's words. Plain words: no jokes.
 */
export function NotFound() {
  const { pathname } = useLocation();
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-16">
      <NothingHere />
      {/* Keyed by the address, so following a suggestion's link to another dead end starts afresh. */}
      <LookFor key={pathname} clues={cluesIn(pathname)} />
      <Button asChild intent="brand" variant="outline" className="self-start">
        <Link to="/">Back to This week</Link>
      </Button>
    </main>
  );
}

/** Outside the frame (an address under onboarding): no pillars to keep, so a way back in. */
export function NotFoundPlain() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-16 md:px-8 lg:pt-16">
      <NothingHere />
      <Button asChild intent="brand" variant="outline" className="self-start">
        <Link to="/">Back to Expecting</Link>
      </Button>
    </main>
  );
}
