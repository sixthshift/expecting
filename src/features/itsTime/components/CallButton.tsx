import { cn } from "@sixthshift/design-system/utils";
import { Phone } from "lucide-react";
import { telHref } from "../../../lib/emergency";

/** A call, big enough for one hand at arm's length: `strong` for the first one to make, `danger` only for a call one of your own taps has set off. */
export function CallButton({ phone, children, tone = "plain" }: { phone: string; children: React.ReactNode; tone?: "strong" | "plain" | "danger" }) {
  return (
    <a
      href={telHref(phone)}
      className={cn(
        "flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold",
        tone === "strong" && "bg-bg-brand-strong text-fg-on-brand-strong hover:bg-bg-brand-strong-hovered",
        tone === "danger" && "bg-bg-danger-strong text-fg-on-danger-strong hover:bg-bg-danger-strong-hovered",
        tone === "plain" && "border border-border-normal bg-bg-normal text-fg-strong hover:bg-bg-subtle-hovered"
      )}
    >
      <Phone aria-hidden size={20} className="shrink-0" />
      {children}
    </a>
  );
}

/** A part of the page: its heading, then what's in it. */
export function Part({ id, title, children, className }: { id: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-3", className)}>
      <h2 id={id} className="text-sm font-semibold tracking-wide text-fg-subtle uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
