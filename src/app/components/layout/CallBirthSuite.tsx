import { useQuery } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { emergencyQuery } from "../../../api/rpc/emergency";
import { telHref } from "../../../lib/emergency";

/**
 * The most important button in the app: your birth suite's number, from
 * Emergency info, one tap from every pillar. On a phone an icon at the top
 * beside Emergency info and settings; on a desktop a row in the sidebar. Until
 * the number is filled in there's nothing to call, so it isn't drawn: the way
 * to Emergency info beside it is where the number goes (and where 000 is).
 * Read without suspense: the frame never waits for it.
 */
export function CallBirthSuite({ layout }: { layout: "icon" | "row" }) {
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
      className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal"
    >
      <Phone aria-hidden size={18} className="text-fg-brand" />
      Call the birth suite
    </a>
  );
}
