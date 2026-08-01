import { CalendarDays } from 'lucide-react';

const toLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dayOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toLocalDate(date);
};

type QuickDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isEn?: boolean;
};

export function QuickDatePicker({ value, onChange, disabled = false, isEn = false }: QuickDatePickerProps) {
  const today = dayOffset(0);
  const yesterday = dayOffset(-1);
  const isCustom = value !== today && value !== yesterday;
  return (
    <fieldset className="grid gap-2">
      <legend className="text-xs font-black text-ink/65">{isEn ? 'Record date' : '记录日期'}</legend>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: today, label: isEn ? 'Today' : '今天' },
          { value: yesterday, label: isEn ? 'Yesterday' : '昨天' },
        ].map(option => (
          <button key={option.value} type="button" disabled={disabled} aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`min-h-11 rounded-2xl border px-3 text-xs font-black ${value === option.value ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white text-ink/65'}`}>
            {option.label}
          </button>
        ))}
        <label className={`relative flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-2xl border px-2 text-xs font-black ${isCustom ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-ink/65'}`}>
          <CalendarDays className="h-4 w-4" />{isEn ? 'Choose' : '选日期'}
          <input aria-label={isEn ? 'Choose another date' : '选择其他日期'} type="date" value={value} disabled={disabled} onChange={event => onChange(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
      </div>
      <output className="text-xs font-bold text-ink/42">{value}</output>
    </fieldset>
  );
}
