import { usePeopleQuery } from "../../../../api/rpc/people";
import { useAccessQuery } from "../../../../api/rpc/session";
import { otherOf, ROLE_NAMES } from "../../../../lib/people";
import { ChangePassword } from "./ChangePassword";
import { Invite } from "./Invite";
import { LogOut } from "./LogOut";
import { Reset } from "./Reset";

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
