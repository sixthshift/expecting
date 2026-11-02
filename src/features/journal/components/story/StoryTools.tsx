import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { getRouteApi } from "@tanstack/react-router";
import { LENS_LABEL, type Lens } from "../../../../lib/story";

const route = getRouteApi("/app/journal");

/** The lenses there's something in, one open (`?show=`): drawn once there's more than All. */
export function LensBar({ lens, lenses }: { lens: Lens; lenses: readonly Lens[] }) {
  const navigate = route.useNavigate();
  if (lenses.length <= 1) return null;
  return (
    <ToggleGroup
      type="single"
      appearance="separate"
      variant="outline"
      size="sm"
      aria-label="Show"
      className="scrollbar-none -mx-4 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0"
      value={lens}
      onValueChange={(value) => navigate({ search: { show: value && value !== "all" ? (value as Lens) : undefined } })}
      options={lenses.map((l) => ({ value: l, label: LENS_LABEL[l] }))}
    />
  );
}

/**
 * Above the story: the zoom (`?zoom=`, with a due date to count weeks from)
 * and the search, while the story is in days and has more than one line.
 * The words are held on the page, not in the address: what you look for is
 * yours.
 */
export function ZoomAndSearch({
  zoomable,
  searchable,
  words,
  onWords,
}: {
  zoomable: boolean;
  searchable: boolean;
  words: string;
  onWords: (words: string) => void;
}) {
  const { zoom } = route.useSearch();
  const navigate = route.useNavigate();
  return (
    <div className="flex flex-wrap items-center gap-3">
      {zoomable ? (
        <ToggleGroup
          type="single"
          appearance="separate"
          variant="ghost"
          size="sm"
          aria-label="Zoom"
          value={zoom ?? "days"}
          onValueChange={(value) => navigate({ search: { zoom: value === "weeks" || value === "pregnancy" ? value : undefined } })}
          options={[
            { value: "days", label: "Days" },
            { value: "weeks", label: "Weeks" },
            { value: "pregnancy", label: "Pregnancy" },
          ]}
        />
      ) : null}
      {!zoom && searchable ? (
        <div className="min-w-48 flex-1">
          <SearchInput value={words} onValueChange={onWords} placeholder="Look through what's kept" aria-label="Search the Journal" />
        </div>
      ) : null}
    </div>
  );
}
