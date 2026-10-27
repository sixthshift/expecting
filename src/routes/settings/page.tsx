import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { FormField } from "@sixthshift/design-system/form-field";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { DateForm } from "../../components/DateForm";
import { Page, Section } from "../../components/Page";
import { ProfileForm } from "../../components/ProfileForm";
import { addDays, formatDate, todayISO } from "../../lib/dates";
import { applyTheme, BABY, type Baby, THEMES, useExpectingTheme } from "../../lib/theme";
import { positionOn, slotLabel } from "../../lib/timeline";
import { COMMIT, VERSION } from "../../lib/version";
import { saveHousehold } from "../../server/functions/household";
import { Route } from "./route";

/** The two dates everything hangs off, and the one question that colours it. */
export function SettingsPage() {
  const router = useRouter();
  const { dueDate, birthDate, baby, profile } = Route.useLoaderData();
  useExpectingTheme(baby);
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
        <Section title="Baby">
          <Card>
            <FormField
              label="Boy or girl?"
              description="Sets Expecting's colours: blue for a boy, pink for a girl, both if you don't know or are keeping it a surprise. Anyone who sees the screen will see the colour."
            >
              <RadioButtonGroup
                options={(Object.keys(BABY) as Baby[]).map((value) => ({ value, label: BABY[value] }))}
                value={baby}
                onValueChange={async (value) => {
                  const next = value as Baby;
                  // Show it at once; the save follows.
                  applyTheme(THEMES[next]);
                  await saveHousehold({ data: { baby: next } });
                  await router.invalidate();
                }}
              />
            </FormField>
          </Card>
        </Section>
      </div>
      <Section title="About you">
        <Card>
          <ProfileForm profile={profile} />
        </Card>
      </Section>
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
