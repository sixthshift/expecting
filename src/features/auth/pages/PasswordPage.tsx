import { Button } from "@sixthshift/design-system/button";
import { Card } from "@sixthshift/design-system/card";
import { getRouteApi } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { choosePassword, usePeopleQuery } from "../../../api/rpc/people";
import { Page } from "../../../components/Page";
import { useEnter } from "../hooks/useEnter";
import { useNewPassword } from "../hooks/useNewPassword";

const route = getRouteApi("/password");

/**
 * Your own password, before going on: you logged in with the one you used to
 * share (or with none, from when logins were off), and from now on each of
 * you has your own.
 */
export function PasswordPage() {
  const { next } = route.useSearch();
  const { data: me } = usePeopleQuery({ select: (people) => people.me });
  const enter = useEnter();
  const { password, check, fields } = useNewPassword();
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!check()) return;
    setPending(true);
    try {
      const result = await choosePassword({ data: { password } });
      if (result.ok) enter(next ?? "/");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="lg:mx-auto lg:flex lg:min-h-dvh lg:max-w-lg lg:items-center">
      <Page title={me ? `Your own password, ${me.name}` : "Your own password"} subtitle="Each of you has your own now. Choose yours to go on.">
        <Card size="lg" className="w-full max-w-md">
          <form onSubmit={submit} className="flex flex-col gap-6">
            {fields}
            <Button type="submit" intent="brand" className="self-start" loading={pending}>
              Choose it
            </Button>
          </form>
        </Card>
      </Page>
    </div>
  );
}
