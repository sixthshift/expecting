import { Message } from "@sixthshift/design-system/message";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

/**
 * Is this normal? opens with when not to wait: before any list, for someone
 * worried now. A note, though danger is an alert by default: it's there
 * whenever the shelf is, not news.
 */
export function GetHelp() {
  return (
    <aside aria-label="Worried now?">
      <Message
        intent="danger"
        role="note"
        className="rounded-xl"
        title="Worried now? Don't wait to read."
        actions={
          <>
            <a href="tel:000" className="flex min-h-11 items-center gap-1.5 font-medium underline">
              <Phone aria-hidden size={14} /> Call 000
            </a>
            <Link to="/emergency" className="flex min-h-11 items-center font-medium underline">
              Your numbers, in Emergency info
            </Link>
          </>
        }
      >
        In an emergency call 000. Otherwise call your hospital's birth suite or your midwife: they would rather hear from you.
      </Message>
    </aside>
  );
}
