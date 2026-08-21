import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export type FilterSheetOption = {
  label: string;
  /** Internal filter value. If provided, used for selection matching and onSelect; otherwise label is used. */
  value?: string;
  hint?: string;
  count?: number;
  disabled?: boolean;
  noMatchLabel?: string;
};

export type FilterSheetGroup = {
  title: string;
  options: FilterSheetOption[];
  selected: string | null;
  onSelect: (value: string) => void;
};

type FilterBottomSheetProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  groups: FilterSheetGroup[];
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  resetLabel?: string;
  applyLabel?: string;
};

export function FilterBottomSheet({
  open,
  title,
  subtitle,
  groups,
  onClose,
  onReset,
  onApply,
  resetLabel = 'Reset',
  applyLabel = 'Apply Filters',
}: FilterBottomSheetProps) {
  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent
        surface="task"
        showCloseButton={false}
        data-surface="filter-task"
        className="flex min-h-0 flex-col overflow-hidden border-white/80 bg-white p-0"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/70 bg-white px-4 py-3 md:px-5 md:py-4">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-[16px] font-black text-ink md:text-[18px]">{title}</DialogTitle>
            {subtitle && <DialogDescription className="mt-1 text-[11px] font-bold leading-relaxed text-ink/45">{subtitle}</DialogDescription>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg text-ink/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="app-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 pb-8 md:px-5">
          <div className="grid gap-5">
            {groups.map(group => (
              <section key={group.title} className="grid gap-2.5">
                <div className="text-[12px] font-black text-ink/70">{group.title}</div>
                <div className="grid grid-cols-2 gap-2 min-[390px]:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                  {group.options.map(option => {
                    const optionValue = option.value ?? option.label;
                    const isAllOption = option.value === '全部' || option.label === 'All' || option.value === null;
                    const selected = group.selected === optionValue || (!group.selected && (optionValue === '全部' || isAllOption));
                    const disabled = Boolean(option.disabled && !selected && !isAllOption);
                    return (
                      <button
                        key={optionValue}
                        type="button"
                        onClick={() => group.onSelect(optionValue)}
                        disabled={disabled}
                        className={`min-h-11 rounded-[14px] border px-3 py-2.5 text-left transition-colors ${
                          selected
                            ? 'border-emerald-700 bg-emerald-700 text-white'
                            : disabled
                              ? 'cursor-not-allowed border-border/70 bg-bg/35 text-ink/26'
                              : 'border-border bg-bg/60 text-ink/64 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="min-w-0 truncate text-[12px] font-black leading-tight">{option.label}</span>
                          {typeof option.count === 'number' && (
                            <span className={`shrink-0 text-[9px] font-black ${selected ? 'text-white/70' : disabled ? 'text-ink/24' : 'text-ink/36'}`}>
                              {option.count}
                            </span>
                          )}
                        </div>
                        {(option.hint || disabled) && (
                          <div className={`mt-0.5 line-clamp-1 text-[9px] font-bold ${selected ? 'text-white/72' : disabled ? 'text-ink/24' : 'text-ink/38'}`}>
                            {disabled ? (option.noMatchLabel ?? 'No match') : option.hint}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <footer className="modalFooter flex shrink-0 gap-2 border-t border-border/70 bg-white">
          <Button type="button" variant="outline" onClick={onReset} className="h-11 flex-1 rounded-full text-[13px] font-black">
            {resetLabel}
          </Button>
          <Button type="button" onClick={onApply} className="h-11 flex-[1.4] rounded-full bg-emerald-700 text-[13px] font-black text-white hover:bg-emerald-800">
            {applyLabel}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
