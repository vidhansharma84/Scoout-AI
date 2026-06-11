"use client";

export default function AlertActions() {
  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <div className="mt-2.5 flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={stop}
        className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors"
      >
        Open clip
      </button>
      <button
        type="button"
        onClick={stop}
        className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors text-foreground/65"
      >
        Mark reviewed
      </button>
      <button
        type="button"
        onClick={stop}
        className="rounded-md border border-border bg-surface px-2.5 py-1 hover:bg-surface-2 transition-colors text-foreground/55"
      >
        Dismiss
      </button>
    </div>
  );
}
