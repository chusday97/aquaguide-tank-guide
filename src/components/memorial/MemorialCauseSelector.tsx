import { Check } from 'lucide-react';
import type { MemorialCauseCode } from '../../types';

const causeOptions: Array<{ code: MemorialCauseCode; zh: string; en: string }> = [
  { code: 'water_quality_change', zh: '水质波动', en: 'Water change' },
  { code: 'oxygen_shortage', zh: '可能缺氧', en: 'Low oxygen' },
  { code: 'temperature_stress', zh: '温度应激', en: 'Temperature stress' },
  { code: 'acclimation_stress', zh: '入缸应激', en: 'Acclimation stress' },
  { code: 'aggression_or_injury', zh: '追咬或受伤', en: 'Aggression or injury' },
  { code: 'feeding_or_digestive', zh: '喂食或消化', en: 'Feeding or digestion' },
  { code: 'suspected_illness', zh: '疑似疾病', en: 'Possible illness' },
  { code: 'recent_medication_or_change', zh: '近期加药或变动', en: 'Recent treatment or change' },
  { code: 'age_related', zh: '可能与年龄有关', en: 'Age related' },
  { code: 'unknown', zh: '暂不确定', en: 'Not sure yet' },
  { code: 'other', zh: '其他', en: 'Other' },
];

export const getMemorialCauseLabel = (code: MemorialCauseCode, isEn = false) => {
  const option = causeOptions.find(item => item.code === code);
  return option ? (isEn ? option.en : option.zh) : code;
};

type MemorialCauseSelectorProps = {
  value: MemorialCauseCode[];
  onChange: (value: MemorialCauseCode[]) => void;
  disabled?: boolean;
  isEn?: boolean;
};

export function MemorialCauseSelector({ value, onChange, disabled = false, isEn = false }: MemorialCauseSelectorProps) {
  const toggle = (code: MemorialCauseCode) => {
    if (code === 'unknown') {
      onChange(value.includes(code) ? [] : ['unknown']);
      return;
    }
    const withoutUnknown = value.filter(item => item !== 'unknown');
    onChange(withoutUnknown.includes(code)
      ? withoutUnknown.filter(item => item !== code)
      : [...withoutUnknown, code].slice(0, 5));
  };

  return (
    <fieldset className="grid gap-2">
      <legend className="text-xs font-black text-ink/65">{isEn ? 'What may have contributed?' : '可能与什么有关'}</legend>
      <p className="text-xs font-semibold leading-5 text-ink/45">{isEn ? 'Choose up to five. This is a care reflection, not a diagnosis.' : '最多选择 5 项。这是养护复盘，不是疾病确诊。'}</p>
      <div className="flex flex-wrap gap-2">
        {causeOptions.map(option => {
          const selected = value.includes(option.code);
          return (
            <button
              key={option.code}
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => toggle(option.code)}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-xs font-black transition-colors disabled:opacity-50 ${selected ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-slate-200 bg-white text-ink/68 hover:border-emerald-300 hover:bg-emerald-50'}`}
            >
              {selected && <Check className="h-3.5 w-3.5" />}
              {isEn ? option.en : option.zh}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
