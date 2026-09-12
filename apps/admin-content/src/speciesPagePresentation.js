export function localizeSpeciesTankSize(value, locale = 'zh-CN') {
  if (locale !== 'en') return value || '—';
  const match = String(value || '').match(/至少\s*(\d+(?:\.\d+)?)\s*升/);
  return match ? `At least ${match[1]} L` : '—';
}

export function getSpeciesPageLabels(locale = 'zh-CN') {
  if (locale === 'en') {
    return {
      breadcrumb: 'Species',
      temperature: 'Temperature',
      ph: 'pH',
      tank: 'Tank size',
      difficulty: 'Difficulty',
      truth: 'Care reference',
      truthNote: 'These reference values come from AquaGuide species records and stay consistent across the site.',
    };
  }
  return {
    breadcrumb: '物种图鉴',
    temperature: '水温',
    ph: 'pH',
    tank: '建议缸体',
    difficulty: '饲养难度',
    truth: '基础饲养参数',
    truthNote: '这些参考参数来自 AquaGuide 物种资料，并在站内保持一致。',
  };
}
