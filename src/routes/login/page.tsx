import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { Page } from "../../components/Page";
import { Route } from "./route";

const errors = {
  wrong: "That's not the password.",
  locked: "Too many tries. Wait a few minutes, then try again.",
} as const;

/** A plain form posting to /api/login, so it works before the app's script has loaded. */
export function LoginPage() {
  const { error, next } = Route.useSearch();
  return (
    // No navigation here, so on a large screen the form sits alone, centred.
    <div className="lg:mx-auto lg:flex lg:min-h-dvh lg:max-w-lg lg:items-center">
      <Page title="Expecting" subtitle="The household password, once per phone or computer.">
        <Card size="lg" className="w-full max-w-md">
          <form method="post" action="/api/login" className="flex flex-col gap-4">
            {next ? <input type="hidden" name="next" value={next} /> : null}
            <FormField label="Password" feedback={error ? { message: errors[error], intent: "danger" } : undefined}>
              <Input type="password" name="password" autoComplete="current-password" required autoFocus />
            </FormField>
            <Button type="submit" intent="brand" className="self-start">
              Log in
            </Button>
          </form>
        </Card>
      </Page>
    </div>
  );
}
