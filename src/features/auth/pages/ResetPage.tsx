import { getRouteApi } from "@tanstack/react-router";
import { Alone } from "../../../components/Alone";
import { CodeEntry } from "../components/CodeEntry";
import { Resetting } from "../components/reset/Resetting";

const route = getRouteApi("/reset");

/** A new password, by the link the other of you made: every phone of yours logs out, and this one in. */
export function ResetPage() {
  const { code } = route.useSearch();
  return (
    <Alone title="A new password" subtitle={code ? undefined : "The code from the link you were sent."}>
      {code ? <Resetting code={code} /> : <CodeEntry to="/reset" />}
    </Alone>
  );
}
