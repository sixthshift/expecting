import { Link } from "@tanstack/react-router";
import { Page } from "../../components/Page";

/** Any address with no page. */
export function NotFound() {
  return (
    <Page title="Not here">
      <p>
        There's no page at this address.{" "}
        <Link to="/" className="underline">
          Back to Expecting
        </Link>
        .
      </p>
    </Page>
  );
}
