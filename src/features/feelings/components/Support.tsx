import { Phone } from "lucide-react";
import type { Role } from "../../../lib/people";
import { ItemLink } from "../../library/components/ItemLink";

/** Who to call, from the checked entry `perinatal-mental-health-help`: PANDA, and Lifeline in a crisis. */
const PANDA = { name: "PANDA", phone: "1300 726 306" };
const LIFELINE = { name: "Lifeline", phone: "13 11 14" };

/** Where to read more: after a loss or hard news, the loss services; for a partner, the entry written for partners, with PANDA's support for dads. */
export function supportItem(role: Role | undefined, quiet = false): string {
  if (quiet) return "loss-support-services";
  return role === "partner" ? "partner-perinatal-depression" : "perinatal-mental-health-help";
}

/** One quiet line of support: someone to talk to, one tap away. Never an alarm. */
export function Support({ itemId }: { itemId: string }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-fg-normal">Want to talk to someone?</p>
      <div className="flex flex-wrap gap-x-4">
        <a href={`tel:${PANDA.phone.replaceAll(" ", "")}`} className="flex min-h-11 items-center gap-1.5 font-medium text-fg-brand underline">
          <Phone aria-hidden size={14} /> {PANDA.name}, {PANDA.phone}
        </a>
        <a href={`tel:${LIFELINE.phone.replaceAll(" ", "")}`} className="flex min-h-11 items-center gap-1.5 text-fg-normal underline">
          <Phone aria-hidden size={14} /> {LIFELINE.name}, {LIFELINE.phone}, if it's a crisis
        </a>
        <ItemLink itemId={itemId} className="flex min-h-11 items-center text-fg-normal underline">
          Where to get help
        </ItemLink>
      </div>
    </div>
  );
}
