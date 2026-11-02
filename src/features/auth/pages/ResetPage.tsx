import { Button } from "@sixthshift/design-system/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { codeQuery, resetPassword } from "../../../api/rpc/session";
import { Alone } from "../../../components/Alone";
import { CodeEntry } from "../components/CodeEntry";
import { useEnter } from "../hooks/useEnter";
import { useNewPassword } from "../hooks/useNewPassword";
import { LOCKED } from "../model/labels";

const route = getRouteApi("/reset");

const problems = {
  code: "That code isn't live: it's been used, or it's more than a day old. Ask for a new one.",
  locked: LOCKED,
} as const;

/** A new password, by the link the other of you made: every phone of yours logs out, and this one in. */
export function ResetPage() {
  const { code } = route.useSearch();
  return (
    <Alone title="A new password" subtitle={code ? undefined : "The code from the link you were sent."}>
      {code ? <Resetting code={code} /> : <CodeEntry to="/reset" />}
    </Alone>
  );
}

function Resetting({ code }: { code: string }) {
  const { data: reset } = useSuspenseQuery(codeQuery("reset", code));
  if (reset === "locked") return <CodeEntry to="/reset" problem={problems.locked} />;
  if (reset?.kind !== "reset") return <CodeEntry to="/reset" problem={problems.code} />;
  return <ResetForm code={code} name={reset.name} />;
}

function ResetForm({ code, name }: { code: string; name: string }) {
  const enter = useEnter();
  const { password, check, fields } = useNewPassword();
  const [problem, setProblem] = useState<keyof typeof problems | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!check()) return;
    setPending(true);
    try {
      const result = await resetPassword({ data: { code, password } });
      if (result.ok) enter(result.next);
      else setProblem(result.error === "locked" ? "locked" : "code");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <p className="text-sm text-fg-normal">
        A new password for {name}. Every phone and computer logged in as {name} will need it.
      </p>
      {fields}
      {problem ? <p className="text-sm text-fg-danger">{problems[problem]}</p> : null}
      <Button type="submit" intent="brand" className="self-start" loading={pending}>
        Choose it
      </Button>
    </form>
  );
}
