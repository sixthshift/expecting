import { type Theme as Mode, useTheme } from "@sixthshift/design-system/hooks";
import { ToggleGroup } from "@sixthshift/design-system/toggle-group";

/** This phone's mode: its own, never shared, and kept on the phone. */
const MODES: { value: Mode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/** Light, dark, or as the phone is set: this phone only. Shown at once, nothing to save. */
export function Appearance() {
  const { theme: mode, setTheme: setMode } = useTheme();
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-normal p-4">
      <p className="text-sm text-fg-normal">Light or dark, on this phone only.</p>
      <ToggleGroup
        type="single"
        appearance="segmented"
        size="sm"
        variant="outline"
        intent="brand"
        aria-label="Light or dark"
        className="self-start"
        value={mode}
        onValueChange={(value) => setMode(value as Mode)}
        options={MODES}
      />
    </div>
  );
}
