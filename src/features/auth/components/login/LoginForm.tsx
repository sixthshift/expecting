import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { getRouteApi } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { login, useAccessQuery } from "../../../../api/rpc/session";
import { Choice } from "../../../../components/Choice";
import { useEnter } from "../../hooks/useEnter";
import { useNewPassword } from "../../hooks/useNewPassword";
import { LOCKED } from "../../model/labels";

const route = getRouteApi("/login");

const errors = {
  wrong: "That's not the password.",
  locked: LOCKED,
  unknown: "That person isn't here any more.",
} as const;

/**
 * Which of you, then your password. With logins off, tapping your name is
 * logging in. One who has no password yet (from a time logins were off)
 * chooses it here.
 */
export function LoginForm() {
  const { next } = route.useSearch();
  const { data: access } = useAccessQuery();
  const enter = useEnter();
  const [personId, setPersonId] = useState<string | undefined>(access.people.length === 1 ? access.people[0]!.id : undefined);
  const [password, setPassword] = useState("");
  const choose = useNewPassword();
  const [error, setError] = useState<keyof typeof errors | null>(null);
  const [pending, setPending] = useState(false);
  const person = access.people.find((p) => p.id === personId);

  async function logIn(id: string, typed?: string) {
    setPending(true);
    try {
      const result = await login({ data: { personId: id, password: typed, next } });
      if (result.ok) {
        enter(result.next);
        return;
      }
      setError(result.error);
      setPassword("");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!person) return;
    if (!person.hasPassword && !choose.check()) return;
    logIn(person.id, person.hasPassword ? password : choose.password);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {access.people.length > 1 || !access.login ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-medium text-fg-normal">Who's this?</legend>
          {access.people.map((p) => (
            <Choice
              key={p.id}
              chosen={p.id === personId}
              onClick={() => {
                setPersonId(p.id);
                setError(null);
                if (!access.login) logIn(p.id);
              }}
            >
              I'm {p.name}
            </Choice>
          ))}
        </fieldset>
      ) : null}
      {access.login && person ? (
        <>
          {person.hasPassword ? (
            <FormField label="Password" feedback={error ? { message: errors[error], intent: "danger" } : undefined}>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
          ) : (
            <>
              <p className="text-sm text-fg-normal">{person.name} has no password yet. Choose one now; from then on it's yours.</p>
              {choose.fields}
            </>
          )}
          <Button type="submit" intent="brand" className="self-start" loading={pending}>
            Log in
          </Button>
        </>
      ) : null}
      {!access.login && error ? <p className="text-sm text-fg-danger">{errors[error]}</p> : null}
    </form>
  );
}
