import { Compass } from "lucide-react";

/** The heading every not-found shares: a soft mark, what happened, and why it might have. */
export function NothingHere({ title = "Nothing at this address" }: { title?: string }) {
  return (
    <header className="flex flex-col items-start gap-3">
      <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-bg-brand-subtle text-fg-brand">
        <Compass size={24} />
      </span>
      <h1 className="text-2xl font-display font-semibold text-fg-strong">{title}</h1>
      <p className="text-fg-subtle">It may have moved, or the link was cut short.</p>
    </header>
  );
}
