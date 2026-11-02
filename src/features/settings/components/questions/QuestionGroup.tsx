import { cn } from "@sixthshift/design-system/utils";
import { usePeopleQuery } from "../../../../api/rpc/people";
import { Section } from "../../../../components/Page";
import { ROLES, type Role, roleName } from "../../../../lib/people";
import { useSettingsPage } from "../../contexts/SettingsPageContext";
import type { Group } from "../../model/facts";
import { BabyRow } from "../colour/BabyRow";
import { DueDateRow } from "../dueDate/DueDateRow";
import { SettingList } from "../settingRow/SettingList";
import { QuestionRow } from "./QuestionRow";

/**
 * One group's questions: those asked once, then those asked of each of you,
 * under each one's name. The pregnancy's begins with the due date and the
 * colours.
 */
export function QuestionGroup({ group, title }: { group: Group; title: string }) {
  const { asks } = useSettingsPage();
  const { people } = usePeopleQuery().data;
  const inGroup = asks.filter((a) => a.question.group === group);
  const once = inGroup.filter((a) => a.about === null);
  const each = (Object.keys(ROLES) as Role[]).map((role) => ({ role, asks: inGroup.filter((a) => a.about === role) })).filter((e) => e.asks.length > 0);
  const rows = once.map((a) => <QuestionRow key={a.key} a={a} />);

  return (
    <Section id={`settings-${group}`} title={title} className="scroll-mt-6">
      {group === "pregnancy" ? (
        <SettingList>
          <DueDateRow />
          <BabyRow />
          {rows}
        </SettingList>
      ) : once.length > 0 ? (
        <SettingList>{rows}</SettingList>
      ) : null}
      {each.map((e) => (
        <div key={e.role} className="flex flex-col gap-2">
          {once.length > 0 || each.length > 1 ? (
            <h3 className={cn("text-sm font-medium text-fg-normal", once.length > 0 && "mt-2")}>{roleName(people, e.role, { start: true })}</h3>
          ) : null}
          <SettingList>
            {e.asks.map((a) => (
              <QuestionRow key={a.key} a={a} />
            ))}
          </SettingList>
        </div>
      ))}
    </Section>
  );
}
