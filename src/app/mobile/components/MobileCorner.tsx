import { Link } from "@tanstack/react-router";
import { Settings, Siren } from "lucide-react";
import { CallBirthSuite } from "../../components/layout/CallBirthSuite";
import { ItsTimeWayIn } from "../../features/itsTime/components/wayIn/ItsTimeWayIn";
import { useLayout } from "../../hooks/useLayout";

/**
 * The top corner of a pillar on a phone: It's time once it's near, the call
 * button, Emergency info, then settings. Nothing on a desktop, which has them
 * in the sidebar.
 */
export function MobileCorner() {
  if (useLayout() !== "mobile") return null;
  return (
    <div className="-mr-2 flex shrink-0 items-center print:hidden">
      <ItsTimeWayIn layout="pill" />
      <CallBirthSuite layout="icon" />
      <Link to="/emergency" aria-label="Emergency info" className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle">
        <Siren aria-hidden size={20} />
      </Link>
      <Link to="/settings" aria-label="Settings" className="flex size-11 shrink-0 items-center justify-center rounded-md text-fg-subtle">
        <Settings aria-hidden size={20} />
      </Link>
    </div>
  );
}
