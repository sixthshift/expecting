import { Button } from "@sixthshift/design-system/button";
import { FormField } from "@sixthshift/design-system/form-field";
import { Input } from "@sixthshift/design-system/input";
import { type FormEvent, type ReactNode, useState } from "react";
import { choosePassword, logOutEverywhere, makeInvite, makeReset, usePeopleQuery } from "../../../../api/rpc/people";
import { logout, useAccessQuery } from "../../../../api/rpc/session";
import { useAction } from "../../../../app/hooks/useAction";
import { otherOf, ROLE_NAMES } from "../../../../lib/people";
import { forgetData } from "../../../../pwa/register";
import { useNewPassword } from "../../../auth/hooks/useNewPassword";

/**
 * Who this phone is logged in as, and the account's upkeep: an invite for the
 * other while there's a place, a link for the other to choose a new password,
 * your own password, and the ways out (this phone, or every one of yours).
 * With logins off, the invite, choosing a password without the one you have
 * (the way back in for one of you alone who forgot it), and logging out.
 */
export function Account() {
  const { data: people } = usePeopleQuery();
  const { data: login } = useAccessQuery({ select: (access) => access.login });
  const other = otherOf(people.people, people.me);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-bg-normal p-4">
      <p className="text-sm text-fg-normal">
        {people.me ? (
          <>
            Logged in as <span className="font-semibold">{people.me.name}</span>.
          </>
        ) : null}{" "}
        {other ? `Expecting is shared with ${other.name}.` : null}
      </p>
      {people.openRole ? <Invite who={ROLE_NAMES[people.openRole]} /> : null}
      {login && other ? <Reset name={other.name} /> : null}
      <ChangePassword askCurrent={login} />
      <LogOut login={login} />
    </div>
  );
}

/** A link and its code, made on a tap, to copy and send. */
function Link({ path, code, expiresAt, children }: { path: string; code: string; expiresAt: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}${path}?code=${encodeURIComponent(code)}`;
  const until = new Date(expiresAt).toLocaleString("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-bg-subtle p-3">
      <p className="text-sm text-fg-normal">{children}</p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 rounded-md bg-bg-normal px-2 py-1 font-mono text-sm break-all text-fg-strong">{url}</code>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="text-xs text-fg-subtle">
        Or the code, to type at {window.location.host}
        {path}: <span className="font-mono text-fg-strong">{code}</span>. Works once, until {until}.
      </p>
    </div>
  );
}

function Invite({ who }: { who: string }) {
  const [invite, setInvite] = useState<{ code: string; expiresAt: string } | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-fg-normal">There's a place for {who}. Send them an invite: they choose their own name and password.</p>
      {invite ? (
        <Link path="/join" code={invite.code} expiresAt={invite.expiresAt}>
          Send them this link. A new invite ends this one.
        </Link>
      ) : null}
      <Button
        variant="outline"
        className="self-start"
        loading={pending}
        onClick={async () => {
          setPending(true);
          try {
            setInvite(await makeInvite());
          } finally {
            setPending(false);
          }
        }}
      >
        {invite ? "A new invite" : `Invite ${who}`}
      </Button>
    </div>
  );
}

function Reset({ name }: { name: string }) {
  const [reset, setReset] = useState<{ code: string; expiresAt: string } | null>(null);
  const [pending, setPending] = useState(false);
  if (reset)
    return (
      <Link path="/reset" code={reset.code} expiresAt={reset.expiresAt}>
        Send {name} this link to choose a new password. Using it logs out every phone of theirs.
      </Link>
    );
  return (
    <Button
      variant="outline"
      className="self-start"
      loading={pending}
      onClick={async () => {
        setPending(true);
        try {
          setReset(await makeReset());
        } finally {
          setPending(false);
        }
      }}
    >
      {name} forgot their password
    </Button>
  );
}

/** Your password: the one you have now asked first, unless logins are off. */
function ChangePassword({ askCurrent }: { askCurrent: boolean }) {
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

function LogOut({ login }: { login: boolean }) {
  const [leaving, setLeaving] = useState<"here" | "everywhere" | null>(null);

  async function leave() {
    await (leaving === "everywhere" ? logOutEverywhere() : logout());
    // Nor in what the service worker keeps for offline.
    await forgetData();
    // A full load, not a navigation: nothing of yours stays in this tab's memory.
    window.location.assign("/login");
  }

  if (leaving)
    return (
      <div className="flex flex-col gap-3 rounded-lg bg-bg-subtle p-3">
        <p className="text-sm text-fg-normal">
          {leaving === "everywhere"
            ? "Log out on every phone and computer logged in as you, this one too? Each will ask for your password. Nothing is lost."
            : login
              ? "Log out on this phone? Coming back takes your password. Nothing is lost."
              : "Log out on this phone, to hand it to the other of you? Nothing is lost."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button intent="danger" onClick={leave}>
            Yes, log out
          </Button>
          <Button variant="outline" onClick={() => setLeaving(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setLeaving("here")}>
        Log out
      </Button>
      {login ? (
        <Button variant="outline" onClick={() => setLeaving("everywhere")}>
          Log out everywhere
        </Button>
      ) : null}
    </div>
  );
}
