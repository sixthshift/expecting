import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { login } from "../../../api/rpc/session";

const route = getRouteApi("/login");

const errors = {
  wrong: "That's not the password.",
  locked: "Too many tries. Wait a few minutes, then try again.",
} as const;

/** The household password, sent to `login`, which sets the cookie and says where to go. */
export function LoginForm() {
  const { next } = route.useSearch();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<keyof typeof errors | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await login({ data: { password, next } });
      if (result.ok) {
        router.history.push(result.next);
        return;
      }
      setError(result.error);
      setPassword("");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
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
      <Button type="submit" intent="brand" className="self-start" loading={pending}>
        Log in
      </Button>
    </form>
  );
}
