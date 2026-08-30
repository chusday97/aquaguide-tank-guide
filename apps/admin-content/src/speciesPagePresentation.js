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
      truth: 'Catalog facts',
      truthNote: 'These values come from AquaGuide Product Truth and are not rewritten by the SEO editor.',
    };
  }
  return {
    breadcrumb: '物种图鉴',
    temperature: '水温',
    ph: 'pH',
    tank: '建议缸体',
    difficulty: '饲养难度',
    truth: 'Catalog 事实数据',
    truthNote: '这些数值来自 AquaGuide Product Truth，SEO 编辑不会改写它们。',
  };
}
