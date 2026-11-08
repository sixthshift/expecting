import { Link } from "@tanstack/react-router";
import { useLibraryItemPage } from "../../contexts/LibraryItemPageContext";

/** An entry your answers or an extra that's off hide: said so, with the way in settings to bring it back. */
export function HiddenEntry() {
  const { hiddenBy, offExtra, Title } = useLibraryItemPage();
  return (
    <div className="flex flex-col gap-2">
      <Title className="text-2xl font-display font-semibold text-fg-strong">Not in your library</Title>
      <p className="text-fg-subtle">
        {offExtra ? (
          <>
            It's part of {offExtra.name}, an extra that's off.{" "}
            <Link to="/settings" search={{ ask: `extra:${offExtra.id}` }} className="underline">
              Turn it on in settings
            </Link>{" "}
            and it appears everywhere it belongs.
          </>
        ) : (
          <>
            Your answers in{" "}
            <Link to="/settings" search={{ ask: hiddenBy }} className="underline">
              settings
            </Link>{" "}
            say this one doesn't apply to you. Change an answer and it comes back.
          </>
        )}
      </p>
    </div>
  );
}
