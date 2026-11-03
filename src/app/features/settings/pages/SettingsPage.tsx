import { Page } from "../../../../components/Page";
import { useLayout } from "../../../hooks/useLayout";
import { SettingsSections } from "../components/sections/SettingsSections";
import { SettingsPageProvider } from "../contexts/SettingsPageContext";
import { SettingsNav } from "../desktop/components/SettingsNav";

/**
 * Everything Expecting has been told, grouped and readable at a glance: the
 * due date and colours with the pregnancy, every question in
 * src/app/features/settings/model/facts.data.ts in its group (each of yours under
 * your name), how many are settled and the next to answer (not while
 * something has happened); the extras; something has happened; then this
 * phone's appearance and your account. `?ask=cover` opens at a question (or
 * `?ask=extra:babymoon` at an extra, `?ask=quiet` at something has happened),
 * as a hidden item's page links here.
 */
export function SettingsPage() {
  const layout = useLayout();
  return (
    <SettingsPageProvider>
      <Page title="Settings">
        {layout === "desktop" ? (
          // On a desktop the sections are down the side too, to go straight to one.
          <div className="grid grid-cols-[13rem_minmax(0,1fr)] items-start gap-10">
            <SettingsNav />
            <SettingsSections />
          </div>
        ) : (
          <SettingsSections />
        )}
      </Page>
    </SettingsPageProvider>
  );
}
