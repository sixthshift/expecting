import { useLocation, useSearch } from "@tanstack/react-router";
import { Library } from "lucide-react";
import { Rail, RailBreak, RailLink } from "../../../../app/desktop/components/Rail";
import { useQuietKind } from "../../../../app/features/quiet/hooks/useQuietKind";
import { behind, DOOR_INFO, DOORS, type Door } from "../../../../lib/library/doors";
import { DOOR_ICONS } from "../../components/doors/doorIcons";
import { useItems } from "../../hooks/useItems";

/**
 * The Library's places on a desktop, down the left of its home, its doors and
 * its entries: the home, then each door (the question you came with), each a
 * filter of the one page (`?door=can-i`), with how much is behind it. The door
 * for when it's hard is apart at the foot, as it is on the page; while
 * something has happened it comes first, as the quiet home has it.
 */
export function LibraryRail() {
  const items = useItems();
  const quiet = useQuietKind();
  const { pathname } = useLocation();
  const { door: open, topic, q } = useSearch({ strict: false }) as { door?: Door; topic?: string; q?: string };
  const onHome = pathname === "/library";
  const hard = behind("hard", items).length > 0 ? <DoorLink door="hard" current={onHome && open === "hard"} count={behind("hard", items).length} /> : null;
  return (
    <Rail label="Library">
      {quiet && hard ? (
        <>
          {hard}
          <RailBreak />
        </>
      ) : null}
      <RailLink to="/library" icon={Library} current={onHome && !open && !topic && !q}>
        Everything
      </RailLink>
      {DOORS.filter((d) => d !== "hard").map((door) => (
        <DoorLink key={door} door={door} current={onHome && open === door} count={behind(door, items).length} />
      ))}
      {!quiet && hard ? (
        <>
          <RailBreak />
          {hard}
        </>
      ) : null}
    </Rail>
  );
}

function DoorLink({ door, current, count }: { door: Door; current: boolean; count: number }) {
  return (
    <RailLink to="/library" search={{ door }} icon={DOOR_ICONS[door]} current={current} count={count}>
      {DOOR_INFO[door].title}
    </RailLink>
  );
}
