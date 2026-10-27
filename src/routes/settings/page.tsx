import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DateForm } from "../../components/DateForm";
import { Page, Section } from "../../components/Page";
import { addDays, formatDate, todayISO } from "../../lib/dates";
import { positionOn, slotLabel } from "../../lib/timeline";
import { COMMIT, VERSION } from "../../lib/version";
import { saveHousehold } from "../../server/functions/household";
import { Route } from "./route";

/** The two dates everything hangs off, and nothing else yet. */
export function SettingsPage() {
  const router = useRouter();
  const { dueDate, birthDate } = Route.useLoaderData();
  const today = todayISO();
  const position = dueDate ? positionOn(today, dueDate, birthDate) : null;

  return (
    <Page
      title="Settings"
      aside={
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <ArrowLeft aria-hidden size={16} /> Timeline
          </Link>
        </Button>
      }
    >
      <div className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
        <Section title="Due date">
          <Card>
            <DateForm
              label="Due date"
              description={
                position
                  ? `${formatDate(dueDate!)}. The app opens at ${slotLabel(position.slot).toLowerCase()}.${position.birthAssumed ? " Past 42 weeks with no birth date, so the due date stands in for the birth." : ""}`
                  : "Where the app opens. It never hides any week."
              }
              value={dueDate}
              submitLabel="Save due date"
              onSave={async (date) => {
                await saveHousehold({ data: { dueDate: date } });
                await router.invalidate();
              }}
            />
          </Card>
        </Section>
        {dueDate ? (
          <Section title="Baby's here">
            <Card>
              <DateForm
                label="Birth date"
                description="Once entered, the weeks after the birth count from this day, not the due date."
                value={birthDate}
                clearable
                maxDate={today}
                minDate={addDays(dueDate, -7 * 20)}
                submitLabel="Save birth date"
                onSave={async (date) => {
                  await saveHousehold({ data: { birthDate: date } });
                  await router.invalidate();
                }}
              />
            </Card>
          </Section>
        ) : null}
      </div>
      <Section title="This phone">
        <form method="post" action="/api/logout">
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </Section>
      <p className="text-xs text-fg-subtle">
        Expecting {VERSION}
        {COMMIT ? ` · ${COMMIT}` : ""}
      </p>
    </Page>
  );
}
