import type { CompatibilityDecision } from '../../modules/knowledge/knowledge.types';

export type CompatibilityStatus = CompatibilityDecision['status'];

export const COMPATIBILITY_STATUS_LABELS = {
  zh: {
    compatible: '可以混养',
    caution: '条件混养',
    not_recommended: '不建议混养',
    insufficient_data: '需要关键信息',
  },
  en: {
    compatible: 'Compatible',
    caution: 'Compatible with conditions',
    not_recommended: 'Not recommended',
    insufficient_data: 'Key information needed',
  },
} as const satisfies Record<'zh' | 'en', Record<CompatibilityStatus, string>>;

export type CompatibilityChineseStatusLabel = (typeof COMPATIBILITY_STATUS_LABELS.zh)[CompatibilityStatus];
export type CompatibilityEnglishStatusLabel = (typeof COMPATIBILITY_STATUS_LABELS.en)[CompatibilityStatus];

export const getCompatibilityStatusLabel = (
  status: CompatibilityStatus,
  locale: 'zh-CN' | 'en',
): CompatibilityChineseStatusLabel | CompatibilityEnglishStatusLabel => (
  locale === 'en'
    ? COMPATIBILITY_STATUS_LABELS.en[status]
    : COMPATIBILITY_STATUS_LABELS.zh[status]
);

export const getCompatibilityStatusLabelLocalized = (
  status: CompatibilityStatus,
  isEnglish: boolean,
) => getCompatibilityStatusLabel(status, isEnglish ? 'en' : 'zh-CN');
