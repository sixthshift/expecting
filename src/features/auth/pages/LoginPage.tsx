import { Card } from "@sixthshift/design-system/card";
import { useAccess } from "../../../api/rpc/session";
import { Page } from "../../../components/Page";
import { ChooseForm } from "../components/ChooseForm";
import { LoginForm } from "../components/LoginForm";

/** The password: logged in with, or, on the first visit, chosen. */
export function LoginPage() {
  const { data: passwordSet } = useAccess({ select: (access) => access.passwordSet });
  return (
    // No navigation here, so on a large screen the form sits alone, centred.
    <div className="lg:mx-auto lg:flex lg:min-h-dvh lg:max-w-lg lg:items-center">
      <Page
        title="Expecting"
        subtitle={passwordSet ? "The password, once per phone or computer." : "Choose a password. You'll both use it, once per phone or computer."}
      >
        <Card size="lg" className="w-full max-w-md">
          {passwordSet ? <LoginForm /> : <ChooseForm />}
        </Card>
      </Page>
    </div>
  );
}
