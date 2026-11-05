import { MobileCorner } from "../../../../app/mobile/components/MobileCorner";
import { useHomePage } from "../../contexts/HomePageContext";
import { Welcome } from "../welcome/Welcome";
import { Hero } from "./Hero";

/** The top of Home: where you are (`Hero`), or "Home" until there's a due date and the welcome under it; on a phone, the corner beside it. */
export function WeekHeader() {
  const { week, dueDate } = useHomePage();
  return (
    <div className="flex flex-col gap-6 mobile:-mb-2">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 pt-[max(1.5rem,env(safe-area-inset-top))] desktop:pt-10">
        {week !== null ? <Hero /> : <h1 className="col-start-1 row-start-1 text-2xl font-display font-semibold text-fg-strong desktop:text-3xl">Home</h1>}
        <div className="col-start-2 row-start-1">
          <MobileCorner />
        </div>
      </header>
      {!dueDate ? <Welcome /> : null}
    </div>
  );
}
