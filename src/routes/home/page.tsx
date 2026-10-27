import { Card } from "@sixthshift/design-system/card";
import { Link, useRouter } from "@tanstack/react-router";
import { DateForm } from "../../components/DateForm";
import { Page } from "../../components/Page";
import { WeekView } from "../../components/WeekView";
import { addDays, todayISO } from "../../lib/dates";
import { positionOn } from "../../lib/timeline";
import { saveHousehold } from "../../server/functions/household";
import { Route } from "./route";

/** The app opens here: the current week, or the one question it needs first. */
export function HomePage() {
  const state = Route.useLoaderData();
  const today = todayISO();
  const { dueDate, birthDate } = state.household;

  if (!dueDate) return <Welcome />;
  const position = positionOn(today, dueDate, birthDate);
  return <WeekView slot={position.slot} position={position} state={state} today={today} />;
}

function Welcome() {
  const router = useRouter();
  const today = todayISO();
  return (
    <Page title="Expecting" subtitle="Your pregnancy, week by week, for both of you.">
      <Card size="lg" className="w-full max-w-lg">
        <DateForm
          label="When's the baby due?"
          description="Your best estimate is fine. Change it after the dating scan."
          value={null}
          submitLabel="Start"
          minDate={addDays(today, -7 * 3)}
          maxDate={addDays(today, 7 * 44)}
          onSave={async (date) => {
            await saveHousehold({ data: { dueDate: date } });
            await router.invalidate();
          }}
        />
      </Card>
      <p className="text-fg-subtle">
        Not sure yet? You can still{" "}
        <Link to="/weeks" className="underline">
          read through the weeks
        </Link>
        .
      </p>
    </Page>
  );
}
