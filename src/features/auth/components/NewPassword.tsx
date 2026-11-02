import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { useState } from "react";
import { MIN_PASSWORD } from "../../../api/rpc/session";

/**
 * A new password, typed twice since a typo would lock you out. `check()` says
 * whether the two match, and marks them if they don't.
 */
export function useNewPassword() {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [mismatch, setMismatch] = useState(false);

  function check(): boolean {
    const same = password === again;
    setMismatch(!same);
    return same;
  }

  const fields = (
    <>
      <FormField label="Password" description={`At least ${MIN_PASSWORD} characters.`}>
        <Input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
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
    </>
  );

  return { password, check, fields };
}
