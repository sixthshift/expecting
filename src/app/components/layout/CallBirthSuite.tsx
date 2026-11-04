import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { emergencyQuery } from "../../../api/rpc/emergency";
import { telHref } from "../../../lib/emergency";

/**
 * The most important button in the app: your birth suite's number, from
 * Emergency info, one tap from every pillar. On a phone an icon at the top
 * beside Emergency info and settings, and the same in the desktop's top bar; where
 * the call is the thing to do now (a movement felt as different), a button. Until
 * the number is filled in there's nothing to call, so it isn't drawn: the way
 * to Emergency info beside it is where the number goes (and where 000 is).
 * Read without suspense: the frame never waits for it.
 */
export function CallBirthSuite({ layout }: { layout: "icon" | "button" }) {
  const { data } = useQuery(emergencyQuery);
  const phone = data?.values.birthSuitePhone;
  if (!phone) return null;

  if (layout === "icon") {
    return (
      <a href={telHref(phone)} aria-label="Call the birth suite" className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-brand">
        <Phone aria-hidden size={20} />
      </a>
    );
  }

  return (
    <a
      href={telHref(phone)}
      className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-bg-brand px-4 font-medium text-fg-on-brand hover:bg-bg-brand-hovered"
    >
      <Phone aria-hidden size={18} />
      Call the birth suite
    </a>
  );
}
