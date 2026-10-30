import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { emergencyQuery } from "../../../api/rpc/emergency";
import { telHref } from "../../../lib/emergency";

/**
 * The most important button in the app: your birth suite's number, from
 * Emergency info, one tap from every pillar. On a phone an icon at the top
 * beside Emergency info and settings; on a desktop a row in the sidebar; where
 * the call is the thing to do now (a movement felt as different), a button. Until
 * the number is filled in there's nothing to call, so it isn't drawn: the way
 * to Emergency info beside it is where the number goes (and where 000 is).
 * Read without suspense: the frame never waits for it.
 */
export function CallBirthSuite({ layout }: { layout: "icon" | "row" | "button" }) {
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

  if (layout === "button") {
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

  return (
    <a
      href={telHref(phone)}
      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
    >
      <Phone aria-hidden size={18} className="text-fg-brand" />
      Call the birth suite
    </a>
  );
}
