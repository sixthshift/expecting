import { PhoneCorner } from "../../../../app/phone/components/PhoneCorner";
import { useThisWeekPage } from "../../contexts/ThisWeekPageContext";
import { Welcome } from "../welcome/Welcome";
import { Hero } from "./Hero";

/** The top of This week: where you are (`Hero`), or "This week" until there's a due date and the welcome under it; on a phone, the corner beside it. */
export function WeekHeader() {
  const { week, dueDate } = useThisWeekPage();
  return (
    <div className="flex flex-col gap-6 phone:-mb-2">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 pt-[max(1.5rem,env(safe-area-inset-top))] desktop:pt-10">
        {week !== null ? <Hero /> : <h1 className="col-start-1 row-start-1 text-2xl font-display font-semibold text-fg-strong desktop:text-3xl">This week</h1>}
        <div className="col-start-2 row-start-1">
          <PhoneCorner />
        </div>
      </header>
      {!dueDate ? <Welcome /> : null}
    </div>
  );
}
