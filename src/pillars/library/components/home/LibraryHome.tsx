import { useNow } from "../../../../api/rpc/settings";
import { Doors } from "../doors/Doors";
import { HardDoor } from "../doors/HardDoor";
import { RightNow } from "../rightNow/RightNow";
import { Topics } from "../topics/Topics";
import { HomeColumn } from "./HomeColumn";

/** The home below the search: the doors, what's open right now, the topics, and the quiet door last. */
export function LibraryHome() {
  const now = useNow();
  return (
    <HomeColumn>
      <Doors />
      {now !== null ? <RightNow now={now} /> : null}
      <Topics />
      <HardDoor />
    </HomeColumn>
  );
}
