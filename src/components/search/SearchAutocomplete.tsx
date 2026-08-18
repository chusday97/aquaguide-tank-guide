import { BookOpenCheck, ChevronDown, Fish, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { ResilientImage } from '../common/ResilientImage';
import type { SearchSuggestion } from '../../services/search/search-suggestions.service';

interface SearchAutocompleteProps {
  value: string;
  suggestions: SearchSuggestion[];
  selectedSpecies?: SearchSuggestion | null;
  placeholder: string;
  inputLabel: string;
  submitLabel: string;
  viewDetailsLabel: string;
  reselectLabel: string;
  speciesGroupLabel: string;
  careGroupLabel: string;
  relatedGroupLabel: string;
  filterGroupLabel: string;
  ownedLabel: (quantity: number) => string;
  onValueChange: (value: string) => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  onSubmit: (value: string) => void;
  onViewSelected?: (suggestion: SearchSuggestion) => void;
  onReselect?: () => void;
  totalSpeciesMatches?: number;
  viewAllSpeciesLabel?: (count: number) => string;
  onViewAllSpecies?: () => void;
  compact?: boolean;
  hideSubmit?: boolean;
  className?: string;
}

const kindIcon = {
  species: Fish,
  care: BookOpenCheck,
  related_query: Search,
  filter: SlidersHorizontal,
} as const;

const groupOrder: SearchSuggestion['kind'][] = ['species', 'care', 'related_query', 'filter'];

export function SearchAutocomplete({
  value,
  suggestions,
  selectedSpecies,
  placeholder,
  inputLabel,
  submitLabel,
  viewDetailsLabel,
  reselectLabel,
  speciesGroupLabel,
  careGroupLabel,
  relatedGroupLabel,
  filterGroupLabel,
  ownedLabel,
  onValueChange,
  onSelectSuggestion,
  onSubmit,
  onViewSelected,
  onReselect,
  totalSpeciesMatches = 0,
  viewAllSpeciesLabel,
  onViewAllSpecies,
  compact = false,
  hideSubmit = false,
  className = '',
}: SearchAutocompleteProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(suggestions.length > 0 ? 0 : -1);
  }, [suggestions]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const choose = (suggestion: SearchSuggestion) => {
    onSelectSuggestion(suggestion);
    setOpen(false);
  };

  const groupLabels: Record<SearchSuggestion['kind'], string> = {
    species: speciesGroupLabel,
    care: careGroupLabel,
    related_query: relatedGroupLabel,
    filter: filterGroupLabel,
  };

  const hasSpeciesOverflow = totalSpeciesMatches > suggestions.filter(item => item.kind === 'species').length && Boolean(viewAllSpeciesLabel);

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className}`}>
      <div className={`flex min-w-0 items-center gap-2 border border-white/80 bg-white shadow-sm ${compact ? 'rounded-2xl px-3' : 'rounded-[22px] p-2'}`}>
        <Search className="h-4 w-4 shrink-0 text-ink/35" />
        <input
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          aria-label={inputLabel}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={event => {
            onValueChange(event.target.value);
            setOpen(true);
          }}
          onKeyDown={event => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
              setActiveIndex(current => Math.min(suggestions.length - 1, current + 1));
              return;
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              setActiveIndex(current => Math.max(0, current - 1));
              return;
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
              return;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              if (open && activeIndex >= 0 && suggestions[activeIndex]) {
                choose(suggestions[activeIndex]);
                return;
              }
              onSubmit(value);
            }
          }}
          className={`min-w-0 flex-1 bg-transparent font-bold text-ink outline-none placeholder:text-ink/30 ${compact ? 'h-11 text-xs' : 'h-11 text-sm'}`}
        />
        {!hideSubmit && (
          <button
            type="button"
            onClick={() => onSubmit(value)}
            className={`shrink-0 rounded-2xl bg-emerald-700 font-black text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${compact ? 'h-9 px-3 text-[11px]' : 'h-11 px-4 text-sm'}`}
          >
            {submitLabel}
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div
          id={listboxId}
          data-search-suggestion-list="true"
          role="listbox"
          aria-label={inputLabel}
          className={`absolute left-0 right-0 z-[120] mt-2 overflow-y-auto rounded-[20px] border border-emerald-100 bg-white p-2 shadow-[0_22px_60px_rgba(15,23,42,0.18)] ${compact ? 'max-h-[300px]' : 'max-h-[min(420px,62dvh)]'}`}
        >
          {groupOrder.map(kind => {
            const group = suggestions.map((suggestion, index) => ({ suggestion, index })).filter(item => item.suggestion.kind === kind);
            if (group.length === 0) return null;
            return (
              <section key={kind} aria-label={groupLabels[kind]} className="not-first:mt-2">
                <div className="px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-ink/35">{groupLabels[kind]}</div>
                <div className="grid gap-1">
                  {group.map(({ suggestion, index }) => {
                    const Icon = kindIcon[suggestion.kind];
                    const active = index === activeIndex;
                    return (
                      <button
                        id={`${listboxId}-option-${index}`}
                        key={suggestion.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onPointerDown={event => event.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => choose(suggestion)}
                        className={`flex min-h-14 w-full min-w-0 items-center gap-3 rounded-[14px] p-2 text-left outline-none ${active ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'hover:bg-bg'}`}
                      >
                        {suggestion.image ? (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-bg">
                            <ResilientImage src={suggestion.image} alt="" className={`h-full w-full ${suggestion.kind === 'species' ? 'object-contain p-1' : 'object-cover'}`} />
                          </span>
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-bg text-emerald-700"><Icon className="h-4 w-4" /></span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block break-words text-xs font-black leading-5 text-ink">{suggestion.label}</span>
                          {suggestion.scientificName && <span className="block truncate text-[10px] font-semibold italic text-ink/42">{suggestion.scientificName}</span>}
                          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] font-bold text-ink/42">
                            {suggestion.category && <span>{suggestion.category}</span>}
                            {typeof suggestion.ownedQuantity === 'number' && suggestion.ownedQuantity > 0 && <span className="text-emerald-700">{ownedLabel(suggestion.ownedQuantity)}</span>}
                          </span>
                        </span>
                        <ChevronDown className="-rotate-90 h-4 w-4 shrink-0 text-ink/25" />
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {hasSpeciesOverflow && viewAllSpeciesLabel && (
            onViewAllSpecies ? (
              <button type="button" onClick={() => { setOpen(false); onViewAllSpecies(); }} className="mt-2 min-h-11 w-full rounded-[14px] border border-emerald-100 bg-emerald-50 px-3 text-xs font-black text-emerald-800">
                {viewAllSpeciesLabel(totalSpeciesMatches)}
              </button>
            ) : (
              <div data-search-overflow-hint="true" className="mt-2 min-h-11 w-full rounded-[14px] border border-emerald-100 bg-emerald-50 px-3 py-3 text-center text-xs font-black text-emerald-800">
                {viewAllSpeciesLabel(totalSpeciesMatches)}
              </div>
            )
          )}
        </div>
      )}

      {selectedSpecies?.kind === 'species' && (
        <section data-selected-species-summary="true" className={`mt-3 flex min-w-0 flex-col gap-3 rounded-[18px] border border-emerald-100 bg-emerald-50/65 p-3 ${compact ? '' : 'sm:flex-row sm:items-center'}`} aria-label={selectedSpecies.label}>
          <span className={`flex shrink-0 items-center justify-center rounded-[14px] bg-white ${compact ? 'h-12 w-12' : 'h-16 w-16'}`}>
            {selectedSpecies.image ? <ResilientImage src={selectedSpecies.image} alt="" className="h-full w-full object-contain p-1.5" /> : <Fish className="h-5 w-5 text-emerald-700" />}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block break-words text-sm font-black text-ink">{selectedSpecies.label}</strong>
            <span className="block truncate text-[11px] font-semibold italic text-ink/45">{selectedSpecies.scientificName}</span>
            <span className="mt-1 block text-[10px] font-bold text-ink/45">{selectedSpecies.category}</span>
          </span>
          <span className="grid shrink-0 grid-cols-1 gap-2 sm:w-auto">
            <button type="button" onClick={() => onViewSelected?.(selectedSpecies)} className="min-h-11 rounded-full bg-emerald-700 px-4 text-xs font-black text-white">{viewDetailsLabel}</button>
            <button type="button" onClick={() => { onReselect?.(); setOpen(true); window.requestAnimationFrame(() => inputRef.current?.focus()); }} className="inline-flex min-h-9 items-center justify-center gap-1 rounded-full px-3 text-[10px] font-black text-ink/48"><RotateCcw className="h-3.5 w-3.5" />{reselectLabel}</button>
          </span>
        </section>
      )}
    </div>
  );
}