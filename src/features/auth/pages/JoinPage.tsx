import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { codeQuery, join, useAccessQuery } from "../../../api/rpc/session";
import { Page } from "../../../components/Page";
import { ROLE_NAMES, type Role } from "../../../lib/people";
import { CodeEntry } from "../components/CodeEntry";
import { useEnter } from "../hooks/useEnter";
import { useNewPassword } from "../hooks/useNewPassword";

const route = getRouteApi("/join");

const problems = {
  code: "That code isn't live: it's been used, or it's more than a week old. Ask for a new one.",
  locked: "Too many tries. Wait a few minutes, then try again.",
  full: "There are two of you already.",
  password: "Choose a password.",
} as const;

/** Joining by the invite the other sent: as the other of you, your name and your password. */
export function JoinPage() {
  const { code } = route.useSearch();
  return (
    <div className="lg:mx-auto lg:flex lg:min-h-dvh lg:max-w-lg lg:items-center">
      <Page title="Join Expecting" subtitle={code ? undefined : "The code from the invite you were sent."}>
        <Card size="lg" className="w-full max-w-md">
          {code ? <Invited code={code} /> : <CodeEntry to="/join" />}
        </Card>
      </Page>
    </div>
  );
}

function Invited({ code }: { code: string }) {
  const { data: invite } = useSuspenseQuery(codeQuery("join", code));
  if (invite === "locked") return <CodeEntry to="/join" problem={problems.locked} />;
  if (invite?.kind !== "join") return <CodeEntry to="/join" problem={problems.code} />;
  return <JoinForm code={code} role={invite.role} by={invite.by} />;
}

function JoinForm({ code, role, by }: { code: string; role: Role; by: string }) {
  const { data: login } = useAccessQuery({ select: (access) => access.login });
  const enter = useEnter();
  const [name, setName] = useState("");
  const { password, check, fields } = useNewPassword();
  const [problem, setProblem] = useState<keyof typeof problems | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (login && !check()) return;
    setPending(true);
    try {
      const result = await join({ data: { code, name, password: login ? password : undefined } });
      if (result.ok) enter(result.next);
      else setProblem(result.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <p className="text-sm text-fg-normal">
        {by} has invited you to share Expecting, as {ROLE_NAMES[role]}.
      </p>
      <FormField label="Your name">
        <Input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="given-name" maxLength={60} />
      </FormField>
      {login ? fields : null}
      {problem ? <p className="text-sm text-fg-danger">{problems[problem]}</p> : null}
      <Button type="submit" intent="brand" className="self-start" loading={pending} disabled={name.trim() === ""}>
        Join
      </Button>
    </form>
  );
}
