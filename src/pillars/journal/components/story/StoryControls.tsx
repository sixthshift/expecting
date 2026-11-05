import { Button } from "@sixthshift/design-system/button";
import { SearchInput } from "@sixthshift/design-system/search-input";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { useLayout } from "../../../../app/hooks/useLayout";
import { type StoryView, VIEW_LABEL } from "../../../../lib/journal/story/views";

/**
 * Above the story: the ways to look at it, one at a time (`views`, the one
 * open `view`), and the search, which looks through all of it (`words`,
 * `onWords`). On a desktop the search is under them; on a phone it's all one
 * row, the search a button that opens its box under it (open while it has
 * words). Drawn by both
 * stories, the Journal's and the quiet one; what they do is the page's
 * (`useStoryView`, `useStorySearch`).
 */
export function StoryControls({
  views,
  view,
  onView,
  searchable,
  words,
  onWords,
}: {
  views: readonly StoryView[];
  view: StoryView;
  onView: (view: StoryView) => void;
  searchable: boolean;
  words: string;
  onWords: (words: string) => void;
}) {
  const layout = useLayout();
  const [looking, setLooking] = useState(false);
  if (views.length <= 1 && !searchable) return null;
  if (layout === "mobile") {
    const open = looking || words !== "";
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {views.length > 1 ? (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              aria-label="Show"
              className="min-w-0 flex-1"
              value={view}
              onValueChange={(value) => onView((value || "days") as StoryView)}
              options={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))}
            />
          ) : (
            <span className="flex-1" />
          )}
          {searchable ? (
            <Button
              variant="outline"
              size="sm"
              iconOnly
              aria-label={open ? "Close the search" : "Search the Journal"}
              aria-expanded={open}
              onClick={() => {
                if (open) onWords("");
                setLooking(!open);
              }}
            >
              {open ? <X aria-hidden size={16} /> : <Search aria-hidden size={16} />}
            </Button>
          ) : null}
        </div>
        {searchable && open ? (
          <SearchInput value={words} onValueChange={onWords} placeholder="Look through what's kept" aria-label="Search the Journal" autoFocus={looking} />
        ) : null}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {views.length > 1 ? (
        <ToggleGroup
          type="single"
          appearance="separate"
          variant="outline"
          size="sm"
          aria-label="Show"
          className="scrollbar-none -mx-4 overflow-x-auto px-4 desktop:mx-0 desktop:flex-wrap desktop:px-0"
          value={view}
          onValueChange={(value) => onView((value || "days") as StoryView)}
          options={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))}
        />
      ) : null}
      {searchable ? <SearchInput value={words} onValueChange={onWords} placeholder="Look through what's kept" aria-label="Search the Journal" /> : null}
    </div>
  );
}
