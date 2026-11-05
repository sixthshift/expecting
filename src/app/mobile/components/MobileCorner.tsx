import { Link } from "@tanstack/react-router";
import { Settings, Siren } from "lucide-react";
import { usePeopleQuery } from "../../../api/rpc/people";
import { CallBirthSuite } from "../../components/layout/CallBirthSuite";
import { ItsTimeWayIn } from "../../features/itsTime/components/wayIn/ItsTimeWayIn";
import { useLayout } from "../../hooks/useLayout";

/**
 * The top corner of a pillar on a phone: It's time once it's near, the call
 * button, Emergency info, then settings as you, your initial (a gear on a
 * phone that hasn't said who's holding it). Nothing on a desktop, which has
 * them in the top bar.
 */
export function MobileCorner() {
  const layout = useLayout();
  const { data: me } = usePeopleQuery({ select: (p) => p.me ?? null });
  if (layout !== "mobile") return null;
  return (
    <div className="-mr-2 flex shrink-0 items-center print:hidden">
      <ItsTimeWayIn />
      <CallBirthSuite layout="icon" />
      <Link to="/emergency" aria-label="Emergency info" className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle">
        <Siren aria-hidden size={20} />
      </Link>
      <Link to="/settings" aria-label="Settings" className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle">
        {me ? (
          <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-bg-brand-subtle text-sm font-semibold text-fg-brand">
            {me.name.slice(0, 1)}
          </span>
        ) : (
          <Settings aria-hidden size={20} />
        )}
      </Link>
    </div>
  );
}
