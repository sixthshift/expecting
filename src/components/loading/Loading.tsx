import { type ComponentType, useState } from "react";
import { Stork } from "./Stork";

/** The loading animations to choose from; one is picked at random each time. */
export const LOADERS: ComponentType[] = [Stork];

/** A loading animation, picked from `LOADERS` when it first draws and kept while it shows. */
export function Loading({ className = "size-24" }: { className?: string }) {
  const [Loader] = useState(() => LOADERS[Math.floor(Math.random() * LOADERS.length)] ?? Stork);
  return (
    <div role="status" aria-label="Loading" className={className}>
      <Loader />
    </div>
  );
}

/** A page still loading: the animation alone, in the middle of the screen. */
export function LoadingPage() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <Loading />
    </div>
  );
}
