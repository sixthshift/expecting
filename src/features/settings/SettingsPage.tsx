import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { FormField } from "@sixthshift/design-system/form-field";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { useNavigate } from "@tanstack/react-router";
import { useAction } from "../../app/useAction";
import { useApp } from "../../app/useApp";
import { useExpectingTheme } from "../../app/useExpectingTheme";
import { DateForm } from "../../components/DateForm";
import { Page, Section } from "../../components/Page";
import { addDays, formatDate, todayISO } from "../../lib/dates";
import { applyTheme, BABY, type Baby, THEMES } from "../../lib/theme";
import { positionOn, slotLabel } from "../../lib/timeline";
import { COMMIT, VERSION } from "../../lib/version";
import { saveHousehold } from "../../server/functions/household";
import { forgetPerson } from "../../server/functions/people";
import { ProfileForm } from "./ProfileForm";

/** The two dates everything hangs off, and the one question that colours it. */
export function SettingsPage() {
  const navigate = useNavigate();
  const [save] = useAction((data: Parameters<typeof saveHousehold>[0]["data"]) => saveHousehold({ data }));
  const { state } = useApp();
  const { me, people } = state;
  const { dueDate, birthDate, baby, profile } = state.household;
  useExpectingTheme(baby);
  const today = todayISO();
  const position = dueDate ? positionOn(today, dueDate, birthDate) : null;

  return (
    <Page title="Settings">
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
              onSave={(date) => save({ dueDate: date })}
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
                onSave={(date) => save({ birthDate: date })}
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
                onValueChange={(value) => {
                  const next = value as Baby;
                  // Show it at once; the save follows.
                  applyTheme(THEMES[next]);
                  return save({ baby: next });
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
        <Card>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-fg-normal">
              {me ? (
                <>
                  This is <span className="font-semibold">{me.name}</span>'s phone.
                </>
              ) : (
                "This phone hasn't said whose it is."
              )}{" "}
              {people.length > 1 ? `Expecting is shared by ${people.map((p) => p.name).join(" and ")}.` : null}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  await forgetPerson();
                  await navigate({ to: "/welcome" });
                }}
              >
                Someone else is using it
              </Button>
              <form method="post" action="/api/logout">
                <Button type="submit" variant="outline">
                  Log out
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </Section>
      <p className="text-xs text-fg-subtle">
        Expecting {VERSION}
        {COMMIT ? ` · ${COMMIT}` : ""}
      </p>
    </Page>
  );
}
