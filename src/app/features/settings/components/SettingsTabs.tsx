import { BarTabs } from "../../../mobile/components/BarTabs";
import { useSettingsPage } from "../contexts/SettingsPageContext";
import { SECTION_ORDER, SECTIONS } from "../model/sections";

/** Settings' sections as tabs in the bar on a phone, each a page (`/settings/<section>`), the open one scrolled into view. A desktop has them down the rail (`SettingsRail`). */
export function SettingsTabs() {
  const { section } = useSettingsPage();
  return (
    <BarTabs
      label="Settings"
      tabs={SECTION_ORDER.map((s) => ({ to: "/settings/$section", params: { section: s }, label: SECTIONS[s], current: s === section }))}
    />
  );
}
