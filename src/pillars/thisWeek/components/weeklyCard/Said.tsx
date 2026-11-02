export function Said({ body, who }: { body: string; who: string }) {
  return (
    <p className="border-l-2 border-border-brand pl-3 whitespace-pre-line text-fg-normal">
      {body}
      <span className="text-sm text-fg-subtle"> — {who}</span>
    </p>
  );
}
