import {
  buildCareSeoAlternates,
  careSeoPublicPath,
  type CareArticleDetailDto,
  type CareSeoProjectionDto,
  type SupportedLocale,
} from '../../../packages/contracts/src/index';

const compact = (value: string) => value.replace(/\s+/g, ' ').trim();
const truncate = (value: string, limit: number) => {
  const text = compact(value);
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
};

export const buildCareSeoProjection = (
  detail: CareArticleDetailDto,
  sourceVersion: number,
  publishedAt: string,
  sourceAuthority: CareSeoProjectionDto['sourceAuthority'],
  locale: SupportedLocale,
): CareSeoProjectionDto => {
  const immediateActions = detail.steps
    .filter(step => step.actionKind === 'immediate')
    .map(step => step.actionTitle || step.instruction);
  const candidateUrl = careSeoPublicPath(detail.catalogKey, locale);
  const alternates = buildCareSeoAlternates(detail.catalogKey);
  return {
    sourceCareId: detail.id,
    sourceCareCatalogKey: detail.catalogKey,
    sourceCareVersion: sourceVersion,
    sourcePublishedAt: publishedAt,
    sourceAuthority,
    locale,
    route: {
      pathname: candidateUrl,
      topicParam: detail.catalogKey,
      candidateUrl,
      alternates,
      readiness: 'blocked',
      blockers: [
        'Canonical Care topic route 已建立，但当前默认 noindex，尚未开放 SEO publication。',
        'Care topic 仍由 SPA client render；static SEO artifact / hosted handoff 尚未建立。',
        'Care SEO editorial snapshot / static artifact 尚未建立；当前继续 noindex。',
      ],
    },
    sourceFacts: {
      title: detail.title,
      category: detail.category,
      urgency: detail.urgency,
      summary: detail.summary,
      symptoms: [...detail.symptoms],
      immediateActions,
      avoidActions: [...detail.avoidActions],
      observeItems: [...detail.observeItems],
      diagnoseWhen: [...detail.diagnoseWhen],
      nextStep: detail.nextStep,
      evidenceCount: detail.references.length,
    },
    suggestedEditorial: {
      seoTitle: truncate(`${detail.title} | AquaGuide`, 60),
      metaDescription: truncate(detail.summary, 160),
      h1: detail.title,
      focusKeyword: detail.keywords[0] || detail.title,
    },
    editableFields: ['seoTitle', 'metaDescription', 'h1', 'focusKeyword'],
    protectedSourceFields: [
      'title', 'category', 'urgency', 'summary', 'symptoms', 'steps',
      'avoidActions', 'observeItems', 'diagnoseWhen', 'nextStep', 'references',
    ],
    publishReady: false,
  };
};
