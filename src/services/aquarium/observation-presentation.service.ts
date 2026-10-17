export const observationOptions = [
  { value: '鱼浮在水面', en: 'Fish floating at surface' },
  { value: '呼吸明显急促', en: 'Rapid breathing' },
  { value: '趴缸或躲藏', en: 'Lying at bottom or hiding' },
  { value: '拒食或抢食异常', en: 'Refusing food or abnormal feeding' },
  { value: '没有明显异常', en: 'No obvious abnormalities' },
] as const;

export type ObservationOptionValue = typeof observationOptions[number]['value'];

const englishToCanonical = new Map<string, ObservationOptionValue>(
  observationOptions.map(item => [item.en, item.value]),
);

const specialNotes = new Map<string, { canonical: string; en: string }>([
  ['未发现明显呼吸异常', { canonical: '未发现明显呼吸异常', en: 'No obvious breathing abnormality' }],
  ['No obvious breathing abnormality', { canonical: '未发现明显呼吸异常', en: 'No obvious breathing abnormality' }],
  ['发现异常', { canonical: '发现异常', en: 'Abnormality observed' }],
  ['Abnormality observed', { canonical: '发现异常', en: 'Abnormality observed' }],
]);

export const getObservationOptionLabel = (value: ObservationOptionValue, isEnglish: boolean) => {
  const option = observationOptions.find(item => item.value === value);
  return isEnglish ? option?.en || value : value;
};

export const normalizeObservationValue = (value: string): string => (
  englishToCanonical.get(value) || specialNotes.get(value)?.canonical || value
);

export const normalizeObservationNote = (note: string | undefined): string | undefined => {
  if (!note) return note;
  const special = specialNotes.get(note);
  if (special) return special.canonical;
  return note
    .split('、')
    .map(part => normalizeObservationValue(part.trim()))
    .join('、');
};

export const presentObservationNote = (note: string | undefined, isEnglish: boolean): string | undefined => {
  const canonical = normalizeObservationNote(note);
  if (!canonical || !isEnglish) return canonical;
  const special = specialNotes.get(canonical);
  if (special) return special.en;
  return canonical
    .split('、')
    .map(part => {
      const option = observationOptions.find(item => item.value === part);
      return option?.en || part;
    })
    .join(', ');
};

export const getObservationHistoryTitle = (isEnglish: boolean) => isEnglish ? 'Logged observation' : '记录观察';
