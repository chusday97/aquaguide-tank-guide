export const CONTENT_LOCALES = [
  { code: 'zh-CN', label: '中文', shortLabel: '中' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
];

export const SOURCE_LOCALE = 'zh-CN';
export const ENGLISH_LOCALE = 'en';

export const seoRowKey = (catalogKey, locale) => `${catalogKey}::${locale}`;
export const groupSeoRowKey = (groupKey, locale) => `${groupKey}::${locale}`;

export const getLocaleLabel = (locale) => (
  CONTENT_LOCALES.find((item) => item.code === locale)?.label || locale
);

export const isEnglishLocale = (locale) => String(locale || '').toLowerCase().startsWith('en');
