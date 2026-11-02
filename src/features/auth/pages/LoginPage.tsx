import { useAccessQuery } from "../../../api/rpc/session";
import { Alone } from "../../../components/Alone";
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
    <Alone title="Expecting" subtitle={subtitle}>
      {access.people.length === 0 ? <SetUpForm /> : <LoginForm />}
    </Alone>
  );
}
