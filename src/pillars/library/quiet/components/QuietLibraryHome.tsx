import { Doors } from "../../components/doors/Doors";
import { HardDoor } from "../../components/doors/HardDoor";
import { HomeColumn } from "../../components/home/HomeColumn";
import { Topics } from "../../components/topics/Topics";

/**
 * The Library's home while something has happened: the quiet door first,
 * then the doors and the topics, and nothing open right now. The search, a
 * door and a shelf are the same in both worlds (`LibraryFrame`).
 */
export function QuietLibraryHome() {
  return (
    <HomeColumn>
      <HardDoor />
      <Doors />
      <Topics />
    </HomeColumn>
  );
}
