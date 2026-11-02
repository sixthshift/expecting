import { Card } from "@sixthshift/design-system/card";
import { useAccessQuery } from "../../../api/rpc/session";
import { Page } from "../../../components/Page";
import { LoginForm } from "../components/LoginForm";
import { SetUpForm } from "../components/SetUpForm";

/** Logging in as one of you, or, on a new instance, setting Expecting up as the first of you. */
export function LoginPage() {
  const { data: access } = useAccessQuery();
  const [only] = access.people.length === 1 ? access.people : [];
  const subtitle =
    access.people.length === 0
      ? "Set it up as one of you. The other joins later, from an invite you send."
      : only
        ? `Log in as ${only.name}. Joining? Open the invite ${only.name} sent you.`
        : access.login
          ? "Which of you, then your password, once per phone or computer."
          : "Which of you, once per phone or computer.";
  return (
    // No navigation here, so on a large screen the form sits alone, centred.
    <div className="lg:mx-auto lg:flex lg:min-h-dvh lg:max-w-lg lg:items-center">
      <Page title="Expecting" subtitle={subtitle}>
        <Card size="lg" className="w-full max-w-md">
          {access.people.length === 0 ? <SetUpForm /> : <LoginForm />}
        </Card>
      </Page>
    </div>
  );
}
