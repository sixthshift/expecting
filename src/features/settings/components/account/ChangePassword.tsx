import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { type FormEvent, useState } from "react";
import { choosePassword } from "../../../../api/rpc/people";
import { useAction } from "../../../../app/hooks/useAction";
import { useNewPassword } from "../../../auth/hooks/useNewPassword";

/** Your password: the one you have now asked first, unless logins are off. */
export function ChangePassword({ askCurrent }: { askCurrent: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const { password, check, fields } = useNewPassword();
  const [change, changing] = useAction(async () => {
    const result = await choosePassword({ data: { current: askCurrent ? current : undefined, password } });
    if (result.ok) {
      setOpen(false);
      setDone(true);
    } else setWrong(true);
  });

  if (!open)
    return (
      <div className="flex flex-col gap-1">
        <Button variant="outline" className="self-start" onClick={() => setOpen(true)}>
          {askCurrent ? "Change your password" : "Choose a new password"}
        </Button>
        {done ? (
          <p className="text-xs text-fg-subtle">
            {askCurrent ? "Changed. Your other phones and computers will ask for it." : "Chosen. It's asked for once logins are on."}
          </p>
        ) : null}
      </div>
    );

  function submit(event: FormEvent) {
    event.preventDefault();
    if (check()) change();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-lg bg-bg-subtle p-3">
      {askCurrent ? (
        <FormField label="Your password now" feedback={wrong ? { message: "That's not it.", intent: "danger" } : undefined}>
          <Input
            type="password"
            name="current"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              setWrong(false);
            }}
          />
        </FormField>
      ) : (
        <p className="text-sm text-fg-normal">Logins are off, so your password now isn't asked. Once they're on, this is the one to use.</p>
      )}
      {fields}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" intent="brand" loading={changing}>
          Change it
        </Button>
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
