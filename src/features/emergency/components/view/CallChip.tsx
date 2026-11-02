import { Phone } from "lucide-react";
import { telHref } from "../../../../lib/emergency";

/** A number to call, in the row at the top; on a narrow phone, only the one that `shrink`s is cut short to keep the row to one line. */
export function CallChip({ phone, label, text, shrink = false }: { phone: string; label: string; text: string; shrink?: boolean }) {
  return (
    <a
      href={telHref(phone)}
      aria-label={label}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-full ${shrink ? "min-w-0" : "shrink-0"} bg-bg-brand-strong px-3 text-sm font-medium text-fg-on-brand-strong hover:bg-bg-brand-strong-hovered sm:px-4`}
    >
      <Phone aria-hidden size={16} className="shrink-0" /> <span className="truncate">{text}</span>
    </a>
  );
}
