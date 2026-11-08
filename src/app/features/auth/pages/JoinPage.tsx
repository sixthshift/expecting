import { getRouteApi } from "@tanstack/react-router";
import { Alone } from "../../../../components/Alone";
import { ByCode } from "../components/ByCode";
import { CodeEntry } from "../components/CodeEntry";

const route = getRouteApi("/join");

/** Joining by the invite the other sent: as the other of you, your name and your password. */
export function JoinPage() {
  const { code } = route.useSearch();
  return (
    <Alone title="Join Expecting" subtitle={code ? undefined : "The code from the invite you were sent."}>
      {code ? <ByCode kind="join" code={code} /> : <CodeEntry to="/join" />}
    </Alone>
  );
}
