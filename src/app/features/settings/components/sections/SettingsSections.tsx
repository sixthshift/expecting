import { useQuietQuery } from "../../../../../api/rpc/quiet";
import { Section } from "../../../../../components/Page";
import { Connections } from "../../../connect/components/Connections";
import { QuietSwitch } from "../../../quiet/components/quietSwitch/QuietSwitch";
import { GROUPS, type Group } from "../../model/facts";
import { Account } from "../account/Account";
import { Appearance } from "../appearance/Appearance";
import { ExtrasList } from "../extras/ExtrasList";
import { AnswersProgress } from "../progress/AnswersProgress";
import { QuestionGroup } from "../questions/QuestionGroup";
import { Version } from "../version/Version";

/** Settings' sections, in one column: how many are settled (not while something has happened), the question groups, the extras, something has happened, Claude, appearance, account. */
export function SettingsSections() {
  const { data: quiet } = useQuietQuery();
  return (
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
  );
}
