import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { emergencyQuery } from "../../../api/rpc/emergency";
import { telHref } from "../../../lib/emergency";

/**
 * The most important button in the app: your birth suite's number, from
 * Emergency info, one tap from every pillar. On a phone an icon at the top
 * beside settings; on a desktop a row in the sidebar. Until the number is
 * filled in, it opens Emergency info, where it goes (and where 000 is).
 * Read without suspense: the frame never waits for it.
 */
export function CallBirthSuite({ layout }: { layout: "icon" | "row" }) {
  const { data } = useQuery(emergencyQuery);
  const phone = data?.values.birthSuitePhone;
  const label = phone ? "Call the birth suite" : "Add the birth suite's number";

  if (layout === "icon") {
    const className = "flex size-11 shrink-0 items-center justify-center rounded-md text-fg-brand";
    return phone ? (
      <a href={telHref(phone)} aria-label={label} className={className}>
        <Phone aria-hidden size={20} />
      </a>
    ) : (
      <Link to="/drawer/emergency" aria-label={label} className={className}>
        <Phone aria-hidden size={20} />
      </Link>
    );
  }

  const className = "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal";
  return phone ? (
    <a href={telHref(phone)} className={className}>
      <Phone aria-hidden size={18} className="text-fg-brand" />
      {label}
    </a>
  ) : (
    <Link to="/drawer/emergency" className={className}>
      <Phone aria-hidden size={18} className="text-fg-brand" />
      {label}
    </Link>
  );
}
