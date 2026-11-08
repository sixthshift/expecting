import { Stork } from "./Stork";

/** A page still loading: the stork, alone in the middle of the screen. */
export function LoadingPage() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div role="status" aria-label="Loading" className="size-24">
        <Stork />
      </div>
    </div>
  );
}
