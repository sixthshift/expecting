import { cn } from "@sixthshift/design-system/utils";
import { Link } from "@tanstack/react-router";
import { Baby, Search, Settings, Siren } from "lucide-react";
import { usePosition } from "../../../api/rpc/settings";
import { gestationLabel } from "../../../lib/timeline";
import { CallBirthSuite } from "../../components/layout/CallBirthSuite";
import { PillarNav } from "../../components/layout/PillarNav";
import { CaptureButton } from "../../features/capture/components/CaptureButton";
import { ItsTimeWayIn } from "../../features/itsTime/components/wayIn/ItsTimeWayIn";
import { useQuietKind } from "../../features/quiet/hooks/useQuietKind";
import { useSearchLibrary } from "../../hooks/useShortcuts";
import { You } from "./You";

const quiet = "text-fg-subtle hover:bg-bg-subtle-hovered hover:text-fg-normal";

/**
 * The desktop's top bar, the same on every page, the app's level of the
 * navigation (a pillar's own places are its rail, `PillarLayout`): on the left
 * Expecting and where you are in the pregnancy, in the middle the pillars, on
 * the right the search, the "+" (on the pillars only), then what the phone
 * keeps in its corner (It's time, the call, Emergency info, settings), and
 * last whose session it is. It stays put while the page scrolls under it, so
 * the one of you not driving never watches it come and go. The desktop's own
 * widths stretch it, as `sm:` does a phone's: the logo's name and the day
 * from 1280px (`xl`); the search box and Emergency info's words from 1536px
 * (`2xl`), a magnifier and a siren under that. So it fits from 1024px.
 */
export function TopBar({ onPillar }: { onPillar: boolean }) {
  return (
    <header className="frame-top-bar sticky top-0 z-30 flex h-(--top-bar) items-center gap-3 border-b border-border-subtle bg-bg-normal/95 px-4 backdrop-blur print:hidden">
      <div className="flex flex-1 basis-0 items-center gap-2">
        <Link to="/" aria-label="Expecting, this week" className="flex min-h-10 shrink-0 items-center gap-2 rounded-md px-1.5 font-semibold text-fg-strong">
          <Baby aria-hidden size={22} className="text-fg-brand" />
          <span className="hidden xl:inline">Expecting</span>
        </Link>
        <WeekChip />
      </div>

      <PillarNav layout="bar" />

      <div className="flex flex-1 basis-0 items-center justify-end gap-1">
        <SearchButton />
        {onPillar ? (
          <div className="mx-1">
            <CaptureButton layout="bar" />
          </div>
        ) : null}
        <ItsTimeWayIn />
        <CallBirthSuite layout="icon" />
        <Link
          to="/emergency"
          aria-label="Emergency info"
          activeProps={{ "aria-current": "page", className: "bg-bg-brand-subtle text-fg-on-brand-subtle" }}
          inactiveProps={{ className: quiet }}
          title="Emergency info"
          className="flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-md text-sm 2xl:px-3"
        >
          <Siren aria-hidden size={18} />
          <span aria-hidden className="hidden whitespace-nowrap 2xl:inline">
            Emergency info
          </span>
        </Link>
        <Link
          to="/settings"
          aria-label="Settings"
          title="Settings"
          activeProps={{ "aria-current": "page", className: "bg-bg-brand-subtle text-fg-on-brand-subtle" }}
          inactiveProps={{ className: quiet }}
          className="flex size-10 shrink-0 items-center justify-center rounded-md"
        >
          <Settings aria-hidden size={18} />
        </Link>
        <You />
      </div>
    </header>
  );
}

/**
 * Where you are in the pregnancy, on every page: the week, and the day within
 * it (`30+2`), opening the whole pregnancy. Not before there's a due date,
 * and not while something has happened, when there's no week to show.
 */
function WeekChip() {
  const position = usePosition();
  if (useQuietKind() || !position) return null;
  return (
    <Link
      to="/timeline"
      aria-label={`Week ${position.week}, ${gestationLabel(position.gestationDays)}: the whole pregnancy`}
      activeProps={{ "aria-current": "page" }}
      className="flex min-h-8 shrink-0 items-center gap-1.5 rounded-full bg-bg-brand-subtle px-3 text-sm whitespace-nowrap text-fg-on-brand-subtle hover:bg-bg-brand-subtle-hovered"
    >
      <span className="font-semibold">Week {position.week}</span>
      <span aria-hidden className="hidden opacity-75 xl:inline">
        · {gestationLabel(position.gestationDays)}
      </span>
    </Link>
  );
}

/** The Library's search from anywhere, the same as `/`: a box to click on a wide screen (`2xl`), a magnifier on a narrower one. */
function SearchButton() {
  const search = useSearchLibrary();
  return (
    <button
      type="button"
      onClick={search}
      aria-label="Search the Library"
      aria-keyshortcuts="/"
      className={cn(
        "flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-md text-sm",
        "2xl:mr-1 2xl:w-52 2xl:justify-start 2xl:border 2xl:border-border-subtle 2xl:bg-bg-subtle 2xl:px-3",
        quiet
      )}
    >
      <Search aria-hidden size={17} />
      <span aria-hidden className="hidden 2xl:inline">
        Search the Library
      </span>
      <kbd aria-hidden className="ml-auto hidden rounded-sm border border-border-normal px-1.5 font-sans text-xs 2xl:inline">
        /
      </kbd>
    </button>
  );
}
