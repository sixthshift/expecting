import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { type FormEvent, useState } from "react";
import { join, useAccessQuery } from "../../../../../api/rpc/session";
import { ROLE_NAMES, type Role } from "../../../../../lib/people";
import { usePending } from "../../../../hooks/usePending";
import { useEnter } from "../../hooks/useEnter";
import { useNewPassword } from "../../hooks/useNewPassword";
import { JOIN_PROBLEMS } from "../../model/labels";

/** Joining, as the other of you: your name, and your password (none with logins off). */
export function JoinForm({ code, role, by }: { code: string; role: Role; by: string }) {
  const { data: login } = useAccessQuery({ select: (access) => access.login });
  const enter = useEnter();
  const [name, setName] = useState("");
  const { password, check, fields } = useNewPassword();
  const [problem, setProblem] = useState<keyof typeof JOIN_PROBLEMS | null>(null);
  const [pending, run] = usePending();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (login && !check()) return;
    await run(async () => {
      const result = await join({ data: { code, name, password: login ? password : undefined } });
      if (result.ok) enter(result.next);
      else setProblem(result.error);
    });
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
      {problem ? <p className="text-sm text-fg-danger">{JOIN_PROBLEMS[problem]}</p> : null}
      <Button type="submit" intent="brand" className="self-start" loading={pending} disabled={name.trim() === ""}>
        Join
      </Button>
    </form>
  );
}
