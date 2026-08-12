type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, subtitle, actionText, onAction }: SectionHeaderProps) {
  return (
    <div className="flex min-w-0 items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="type-card-title text-ink">{title}</h2>
        {subtitle && (
          <p className="type-meta mt-1 text-ink/52">{subtitle}</p>
        )}
      </div>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="type-action shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-ink/62 transition-colors hover:border-accent hover:text-accent"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
