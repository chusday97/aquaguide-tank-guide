import { Minus, Plus } from 'lucide-react';

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 100000, disabled = false, label }: QuantityStepperProps) {
  const update = (next: number) => onChange(Math.min(max, Math.max(min, Math.round(next || min))));
  return (
    <div className="inline-grid min-h-11 grid-cols-[44px_minmax(64px,1fr)_44px] overflow-hidden rounded-2xl border border-slate-200 bg-white" role="group" aria-label={label}>
      <button type="button" aria-label={`${label} - 1`} disabled={disabled || value <= min} onClick={() => update(value - 1)} className="grid min-h-11 place-items-center border-r border-slate-200 text-ink/55 hover:bg-slate-50 disabled:opacity-35"><Minus className="h-4 w-4" /></button>
      <input aria-label={label} inputMode="numeric" value={value} disabled={disabled} onChange={event => update(Number(event.target.value))} className="min-w-0 border-0 bg-transparent px-2 text-center text-sm font-black text-ink outline-none" />
      <button type="button" aria-label={`${label} + 1`} disabled={disabled || value >= max} onClick={() => update(value + 1)} className="grid min-h-11 place-items-center border-l border-slate-200 text-ink/55 hover:bg-slate-50 disabled:opacity-35"><Plus className="h-4 w-4" /></button>
    </div>
  );
}
