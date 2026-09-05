import type { CareArticleDetailDto, CareSeoProjectionDto, SupportedLocale } from '../../../packages/contracts/src/index';

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
  const candidateUrl = `/care?topic=${encodeURIComponent(detail.catalogKey)}`;
  return {
    sourceCareId: detail.id,
    sourceCareCatalogKey: detail.catalogKey,
    sourceCareVersion: sourceVersion,
    sourcePublishedAt: publishedAt,
    sourceAuthority,
    locale,
    route: {
      pathname: '/care',
      topicParam: detail.catalogKey,
      candidateUrl,
      readiness: 'blocked',
      blockers: [
        'Care topic 目前通过 /care?topic=... 打开，不是独立可抓取文章路由。',
        'Topic detail 当前渲染在 Dialog 内，没有 topic 级 document title / meta description。',
        'Topic 级 canonical / hreflang contract 尚未建立。',
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
