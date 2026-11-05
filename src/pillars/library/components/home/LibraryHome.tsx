import { useNow } from "../../../../api/rpc/settings";
import { Doors } from "../doors/Doors";
import { HardDoor } from "../doors/HardDoor";
import { RightNow } from "../rightNow/RightNow";
import { Topics } from "../topics/Topics";
import { HomeColumn } from "./HomeColumn";

/** The home below the search, on a phone and a desktop: what's open right now first, then the doors, the topics, and the quiet door last. */
export function LibraryHome() {
  const now = useNow();
  return (
    <HomeColumn>
      {now !== null ? <RightNow now={now} /> : null}
      <Doors />
      <Topics />
      <HardDoor />
    </HomeColumn>
  );
}
