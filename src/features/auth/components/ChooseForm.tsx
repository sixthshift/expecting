import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { type Access, accessQuery, choosePassword, MIN_PASSWORD } from "../../../api/rpc/session";

const route = getRouteApi("/login");

/**
 * The first visit: the password, typed twice since a typo would
 * lock you both out, sent to `choosePassword`, which logs this browser in.
 */
export function ChooseForm() {
  const { next } = route.useSearch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== again) {
      setMismatch(true);
      return;
    }
    setPending(true);
    try {
      const result = await choosePassword({ data: { password, next } });
      // Set either way: chosen now, or by someone else first, when the page turns into the login.
      queryClient.setQueryData<Access>(accessQuery.queryKey, (access) => access && { ...access, passwordSet: true });
      if (result.ok) router.history.push(result.next);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormField label="Password" description={`At least ${MIN_PASSWORD} characters.`}>
        <Input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>
      <FormField label="The same again" feedback={mismatch ? { message: "Those two don't match.", intent: "danger" } : undefined}>
        <Input
          type="password"
          name="again"
          autoComplete="new-password"
          required
          value={again}
          onChange={(e) => {
            setAgain(e.target.value);
            setMismatch(false);
          }}
        />
      </FormField>
      <Button type="submit" intent="brand" className="self-start" loading={pending}>
        Choose it
      </Button>
    </form>
  );
}
