import { settingsSaves, useSettingsQuery } from "../../../../../api/rpc/settings";
import { useSave } from "../../../../hooks/useSave";
import { ColourChoice } from "./ColourChoice";

/** Boy or girl, as a row that's always open: choosing is answering. */
export function BabyRow() {
  const { data: baby } = useSettingsQuery({ select: (s) => s.baby });
  const save = useSave(settingsSaves.saveSettings);
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-fg-strong">Boy or girl?</span>
        <span className="text-xs text-fg-subtle">
          Sets Expecting's colours. Anyone who sees the screen sees them, so keeping it a surprise is an answer too.
        </span>
      </div>
      <ColourChoice value={baby} onChoose={(next) => save({ baby: next })} />
    </div>
  );
}
