import { ChevronRight, MapPin } from "lucide-react";
import { ItemLink } from "../../../library/components/ItemLink";
import { CallButton, Part } from "../CallButton";

/** A plain maps link: the phone picks its own app. */
export function mapsHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.replace(/\n/g, ", "))}`;
}

/**
 * Getting there: the hospital, with the way to open it in maps; getting in
 * (parking, the after-hours entrance); a backup if you can't drive; and the
 * 000 line for a baby coming on the way (`getting-to-hospital`). For a home
 * birth it turns round: the hospital is the backup, for a transfer.
 */
export function GettingThere({ values, home }: { values: Readonly<Record<string, string>>; home: boolean }) {
  return (
    <Part id="getting-there" title={home ? "If you need to go in" : "Getting there"}>
      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-normal px-4 py-3">
        {values.hospital ? (
          <div className="flex flex-col gap-2">
            <p className="whitespace-pre-line font-medium text-fg-strong">{values.hospital}</p>
            <a
              href={mapsHref(values.hospital)}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 w-fit items-center gap-2 rounded-xl border border-border-normal px-4 font-medium text-fg-brand hover:bg-bg-subtle-hovered"
            >
              <MapPin aria-hidden size={18} /> Open maps
            </a>
          </div>
        ) : (
          <p className="text-fg-subtle">The hospital's address goes in Emergency info.</p>
        )}
        {values.hospitalWayIn && !home ? <p className="whitespace-pre-line text-fg-normal">{values.hospitalWayIn}</p> : null}
        {home ? (
          <p className="text-fg-normal">Your midwife decides if you need to go in, and how.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-fg-normal">If you can't drive: {values.backupDriver ?? "a taxi or rideshare"}. The advice is that she doesn't drive herself.</p>
            {values.backupDriverPhone ? <CallButton phone={values.backupDriverPhone}>Call {values.backupDriver ?? "them"}</CallButton> : null}
          </div>
        )}
        <p className="font-medium text-fg-strong">If you think the baby will come before you get there, call 000.</p>
      </div>
      <ItemLink itemId="getting-to-hospital" className="flex min-h-11 w-fit items-center gap-1 text-sm text-fg-subtle hover:text-fg-normal">
        Getting to the hospital
        <ChevronRight aria-hidden size={16} />
      </ItemLink>
    </Part>
  );
}
