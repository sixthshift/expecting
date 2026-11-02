/** Skip a step: go on with nothing saved for it. */
export function SkipButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 self-start text-sm text-fg-subtle underline hover:text-fg-normal">
      Skip for now
    </button>
  );
}
