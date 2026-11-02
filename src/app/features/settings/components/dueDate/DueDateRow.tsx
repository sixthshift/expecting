import { Badge } from "@sixthshift/design-system/badge";
import { settingsSaves, usePosition, useSettingsQuery } from "../../../../../api/rpc/settings";
import { todayISO } from "../../../../../lib/dates";
import { fullDate, toGo } from "../../../../../lib/labels";
import { gestationLabel } from "../../../../../lib/timeline";
import { useSave } from "../../../../hooks/useSave";
import { DUE_DATE, useSettingsPage } from "../../contexts/SettingsPageContext";
import { SettingRow } from "../settingRow/SettingRow";
import { DueDateForm } from "./DueDateForm";

/** The due date as a row, with how far along it makes you today; open, the way to change it. */
export function DueDateRow() {
  const { open, toggle, close } = useSettingsPage();
  const { data: dueDate } = useSettingsQuery({ select: (s) => s.dueDate });
  const position = usePosition();
  const save = useSave(settingsSaves.saveSettings);
  return (
    <SettingRow
      id={DUE_DATE}
      label="Due date"
      open={open === DUE_DATE}
      onToggle={() => toggle(DUE_DATE)}
      value={
        dueDate ? (
          fullDate(dueDate)
        ) : (
          <Badge variant="soft" intent="brand" size="sm">
            Not set
          </Badge>
        )
      }
      meta={
        position && dueDate
          ? `${gestationLabel(position.gestationDays)} today · ${toGo(todayISO(), dueDate, { short: true })}`
          : "Until there is one, Expecting opens at week 1"
      }
    >
      <DueDateForm
        key={dueDate}
        value={dueDate}
        submitLabel="Save due date"
        description="Expecting opens at its week. It never hides any week."
        onSave={async (date) => {
          save({ dueDate: date });
          close();
        }}
      />
    </SettingRow>
  );
}
