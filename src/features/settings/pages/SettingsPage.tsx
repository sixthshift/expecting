import { useQuietQuery } from "../../../api/rpc/quiet";
import { Page, Section } from "../../../components/Page";
import { Connections } from "../../connect/components/Connections";
import { QuietSwitch } from "../../quiet/components/quietSwitch/QuietSwitch";
import { Account } from "../components/account/Account";
import { Appearance } from "../components/appearance/Appearance";
import { ExtrasList } from "../components/extras/ExtrasList";
import { SettingsNav } from "../components/nav/SettingsNav";
import { AnswersProgress } from "../components/progress/AnswersProgress";
import { QuestionGroup } from "../components/questions/QuestionGroup";
import { Version } from "../components/version/Version";
import { SettingsPageProvider } from "../contexts/SettingsPageContext";
import { GROUPS, type Group } from "../model/facts";

/**
 * Everything Expecting has been told, grouped and readable at a glance: the
 * due date and colours with the pregnancy, every question in
 * src/features/settings/model/facts.data.ts in its group (each of yours under
 * your name), how many are settled and the next to answer (not while
 * something has happened); the extras; something has happened; then this
 * phone's appearance and your account. `?ask=cover` opens at a question (or
 * `?ask=extra:babymoon` at an extra, `?ask=quiet` at something has happened),
 * as a hidden item's page links here.
 */
export function SettingsPage() {
  const { data: quiet } = useQuietQuery();
  return (
    <SettingsPageProvider>
      <Page title="Settings">
        <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-10">
          <SettingsNav />

          <div className="flex min-w-0 flex-col gap-8">
            {quiet ? null : <AnswersProgress />}

            {(Object.entries(GROUPS) as [Group, string][]).map(([group, title]) => (
              <QuestionGroup key={group} group={group} title={title} />
            ))}

            <Section id="settings-extras" title="Extras" className="scroll-mt-6">
              <p className="-mt-1 text-sm text-fg-subtle">The parts of Expecting you choose. Each is off until one of you turns it on, and off means gone.</p>
              <ExtrasList />
            </Section>

            <Section id="settings-quiet" title="Something has happened" className="scroll-mt-6">
              <div id="setting-quiet" className="scroll-mt-6">
                <QuietSwitch />
              </div>
            </Section>

            <Section id="settings-claude" title="Claude" className="scroll-mt-6">
              <Connections />
            </Section>

            <Section id="settings-appearance" title="Appearance" className="scroll-mt-6">
              <Appearance />
            </Section>

            <Section id="settings-account" title="Account" className="scroll-mt-6">
              <Account />
            </Section>

            <Version />
          </div>
        </div>
      </Page>
    </SettingsPageProvider>
  );
}
