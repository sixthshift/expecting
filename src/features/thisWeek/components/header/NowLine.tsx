import { formatDate } from "../../../../lib/dates";
import { toGo } from "../../../../lib/labels";
import { gestationLabel } from "../../../../lib/timeline";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";

/** Where you are: "28+0 · 84 days to go · due Wed, 20 Jan 2027". */
export function NowLine() {
  const { position, dueDate, today } = useThisWeekPage();
  if (!position || !dueDate) return null;
  return (
    <p className="text-sm text-fg-strong">
      <span className="font-semibold">{gestationLabel(position.gestationDays)}</span>
      {" · "}
      {toGo(today, dueDate)}
      <span className="text-fg-subtle"> · due {formatDate(dueDate)}</span>
    </p>
  );
}
