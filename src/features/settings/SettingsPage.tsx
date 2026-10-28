import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { FormField } from "@sixthshift/design-system/form-field";
import { RadioButtonGroup } from "@sixthshift/design-system/radio-button-group";
import { useNavigate } from "@tanstack/react-router";
import { saveHousehold } from "../../api/rpc/household";
import { forgetPerson } from "../../api/rpc/people";
import { logout } from "../../api/rpc/session";
import { DateForm } from "../../components/DateForm";
import { Page, Section } from "../../components/Page";
import { formatDate, todayISO } from "../../lib/dates";
import { applyTheme, BABY, type Baby, THEMES } from "../../lib/theme";
import { positionOn, weekLabel } from "../../lib/timeline";
import { COMMIT, VERSION } from "../../lib/version";
import { useExpectingTheme } from "../app/useExpectingTheme";
import { useAction } from "../household/useAction";
import { useApp } from "../household/useApp";
import { FactsForm } from "./FactsForm";

/** The date everything hangs off, the one question that colours it, the answers, and this phone. */
export function SettingsPage() {
  const navigate = useNavigate();
  const [save] = useAction((data: Parameters<typeof saveHousehold>[0]["data"]) => saveHousehold({ data }));
  const { state } = useApp();
  const { me, people } = state;
  const { dueDate, baby } = state.household;
  useExpectingTheme(baby);
  const position = dueDate ? positionOn(todayISO(), dueDate) : null;

  return (
    <Page title="Settings">
      <div className="grid items-start gap-6 md:grid-cols-2 md:gap-8">
        <Section title="Due date">
          <Card>
            <DateForm
              label="Due date"
              description={
                position
                  ? `${formatDate(dueDate!)}. The app opens at ${weekLabel(position.week).toLowerCase()}.`
                  : "Where the app opens. It never hides any week."
              }
              value={dueDate}
              submitLabel="Save due date"
              onSave={(date) => save({ dueDate: date })}
            />
          </Card>
        </Section>
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
          <FactsForm answers={state.answers} people={people} />
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
                  await navigate({ to: "/onboarding" });
                }}
              >
                Someone else is using it
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await logout();
                  // A full load, not a navigation: nothing of the household stays in this tab's memory.
                  window.location.assign("/login");
                }}
              >
                Log out
              </Button>
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
