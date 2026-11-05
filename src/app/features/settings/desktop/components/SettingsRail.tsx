import { Baby, Bot, Briefcase, Footprints, HeartHandshake, type LucideIcon, Palette, Puzzle, Stethoscope, User } from "lucide-react";
import { Rail, RailLink } from "../../../../desktop/components/Rail";
import { useSettingsPage } from "../../contexts/SettingsPageContext";
import { isGroup, SECTION_ORDER, SECTIONS, type SettingsSection } from "../../model/sections";

const ICONS: Record<SettingsSection, LucideIcon> = {
  pregnancy: Baby,
  care: Stethoscope,
  work: Briefcase,
  after: Footprints,
  extras: Puzzle,
  quiet: HeartHandshake,
  claude: Bot,
  appearance: Palette,
  account: User,
};

/** Settings' sections down the left on a desktop, each a page, a question group with how many it has still to answer. A phone has them as tabs (`SettingsTabs`). */
export function SettingsRail() {
  const { section, waiting } = useSettingsPage();
  return (
    <Rail label="Settings">
      {SECTION_ORDER.map((s) => (
        <RailLink
          key={s}
          to="/settings/$section"
          params={{ section: s }}
          icon={ICONS[s]}
          current={s === section}
          count={isGroup(s) && waiting(s) > 0 ? waiting(s) : undefined}
        >
          {SECTIONS[s]}
        </RailLink>
      ))}
    </Rail>
  );
}
