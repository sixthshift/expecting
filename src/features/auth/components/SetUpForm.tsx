import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { accessQuery, setUp, useAccessQuery } from "../../../api/rpc/session";
import { ROLES, type Role } from "../../../lib/people";
import { useEnter } from "../hooks/useEnter";
import { Choice } from "./Choice";
import { useNewPassword } from "./NewPassword";

const route = getRouteApi("/login");

/**
 * A new instance: the first of you, either of you, says which they are, their
 * name and their password (none with logins off), and is in. The other joins
 * later, by an invite from Settings.
 */
export function SetUpForm() {
  const { next } = route.useSearch();
  const { data: login } = useAccessQuery({ select: (access) => access.login });
  const enter = useEnter();
  const queryClient = useQueryClient();
  const [role, setRole] = useState<Role | undefined>();
  const [name, setName] = useState("");
  const { password, check, fields } = useNewPassword();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!role || (login && !check())) return;
    setPending(true);
    try {
      const result = await setUp({ data: { role, name, password: login ? password : undefined, next } });
      if (result.ok) enter(result.next);
      // Someone set it up first: the page turns into the login.
      else await queryClient.invalidateQueries({ queryKey: accessQuery.queryKey });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-fg-normal">Which of you is this?</legend>
        {(Object.keys(ROLES) as Role[]).map((r) => (
          <Choice key={r} chosen={role === r} onClick={() => setRole(r)}>
            {ROLES[r]}
          </Choice>
        ))}
      </fieldset>
      <FormField label="Your name">
        <Input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="given-name" maxLength={60} />
      </FormField>
      {login ? fields : null}
      <Button type="submit" intent="brand" className="self-start" loading={pending} disabled={!role || name.trim() === ""}>
        Set up Expecting
      </Button>
    </form>
  );
}
