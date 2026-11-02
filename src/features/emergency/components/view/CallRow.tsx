import { Phone } from "lucide-react";
import { telHref } from "../../../../lib/emergency";

/** Someone else to call: who, about them, and their number. */
export function CallRow({ label, about, phone }: { label: string; about?: string; phone?: string }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="font-medium text-fg-strong">{label}</span>
        {about ? <span className="whitespace-pre-line text-sm text-fg-subtle">{about}</span> : null}
      </div>
      {phone ? (
        <a
          href={telHref(phone)}
          aria-label={`Call ${phone}`}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border-subtle px-4 text-sm font-medium text-fg-brand hover:bg-bg-subtle-hovered"
        >
          <Phone aria-hidden size={16} /> {phone}
        </a>
      ) : null}
    </li>
  );
}
