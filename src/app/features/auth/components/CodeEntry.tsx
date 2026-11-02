import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";

/** The code, typed, for one read off the other's screen rather than opened as a link. */
export function CodeEntry({ to, problem }: { to: "/join" | "/reset"; problem?: string }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    navigate({ to, search: { code: code.trim() } });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormField label="Code" description="Like K7Q-MP3-XD9-VA2." feedback={problem ? { message: problem, intent: "danger" } : undefined}>
        <Input value={code} onChange={(e) => setCode(e.target.value)} required autoComplete="one-time-code" autoCapitalize="characters" maxLength={40} />
      </FormField>
      <Button type="submit" intent="brand" className="self-start">
        Go on
      </Button>
    </form>
  );
}
