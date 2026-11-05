import { useQuietQuery } from "../../../../api/rpc/quiet";
import { Section } from "../../../../components/Page";
import { PillarLayout } from "../../../components/layout/PillarLayout";
import { Connections } from "../../connect/components/Connections";
import { QuietSwitch } from "../../quiet/components/quietSwitch/QuietSwitch";
import { Account } from "../components/account/Account";
import { Appearance } from "../components/appearance/Appearance";
import { ExtrasList } from "../components/extras/ExtrasList";
import { AnswersProgress } from "../components/progress/AnswersProgress";
import { QuestionGroup } from "../components/questions/QuestionGroup";
import { SettingsTabs } from "../components/SettingsTabs";
import { Version } from "../components/version/Version";
import { SettingsPageProvider, useSettingsPage } from "../contexts/SettingsPageContext";
import { SettingsRail } from "../desktop/components/SettingsRail";
import { isGroup, SECTIONS } from "../model/sections";

/**
 * Settings, a section a page (`/settings/<section>`): each question group
 * (every question in src/app/features/settings/model/facts.data.ts in its
 * group, each of yours under your name; the pregnancy's begins with the due
 * date and the colours), with how many are settled and the next to answer
 * (not while something has happened); the extras; something has happened;
 * Claude; then this phone's appearance and your account. On a desktop the
 * sections are down the rail, on a phone tabs in the bar. `?ask=cover` opens
 * at a question on its section's page (or `?ask=extra:babymoon` at an extra,
 * `?ask=quiet` at something has happened), as a hidden item's page links
 * here; `/settings?ask=…` finds the section.
 */
export function SettingsPage() {
  return (
    <SettingsPageProvider>
      <Sections />
    </SettingsPageProvider>
  );
}

function Sections() {
  const { section } = useSettingsPage();
  return (
    <PillarLayout rail={<SettingsRail />} tabs={{ title: "Settings", nav: <SettingsTabs /> }} title={SECTIONS[section]} width="3xl">
      {/* The page is the section, so its own heading is for a screen reader only: the page's (or the tab's) says it. */}
      <div className="flex min-w-0 flex-col gap-8 [&>section>h2:first-child]:sr-only">
        <SectionBody />
      </div>
    </PillarLayout>
  );
}

function SectionBody() {
  const { section } = useSettingsPage();
  const { data: quiet } = useQuietQuery();
  if (isGroup(section)) {
    return (
      <>
        {quiet ? null : <AnswersProgress />}
        <QuestionGroup group={section} title={SECTIONS[section]} />
      </>
    );
  }
  switch (section) {
    case "extras":
      return (
        <Section id="settings-extras" title="Extras">
          <p className="text-sm text-fg-subtle">The parts of Expecting you choose. Each is off until one of you turns it on, and off means gone.</p>
          <ExtrasList />
        </Section>
      );
    case "quiet":
      return (
        <Section id="settings-quiet" title="Something has happened">
          <div id="setting-quiet" className="scroll-mt-40">
            <QuietSwitch />
          </div>
        </Section>
      );
    case "claude":
      return (
        <Section id="settings-claude" title="Claude">
          <Connections />
        </Section>
      );
    case "appearance":
      return (
        <Section id="settings-appearance" title="Appearance">
          <Appearance />
        </Section>
      );
    case "account":
      return (
        <>
          <Section id="settings-account" title="Account">
            <Account />
          </Section>
          <Version />
        </>
      );
  }
}
