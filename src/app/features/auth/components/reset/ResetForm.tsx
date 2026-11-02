import { Button } from "@sixthshift/design-system/button";
import { type FormEvent, useState } from "react";
import { resetPassword } from "../../../../../api/rpc/session";
import { useEnter } from "../../hooks/useEnter";
import { useNewPassword } from "../../hooks/useNewPassword";
import { RESET_PROBLEMS } from "../../model/labels";

/** A new password for whoever the link is for. */
export function ResetForm({ code, name }: { code: string; name: string }) {
  const enter = useEnter();
  const { password, check, fields } = useNewPassword();
  const [problem, setProblem] = useState<keyof typeof RESET_PROBLEMS | null>(null);
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
      {problem ? <p className="text-sm text-fg-danger">{RESET_PROBLEMS[problem]}</p> : null}
      <Button type="submit" intent="brand" className="self-start" loading={pending}>
        Choose it
      </Button>
    </form>
  );
}
