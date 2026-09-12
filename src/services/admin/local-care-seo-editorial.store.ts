import {
  buildCareSeoAlternates,
  careSeoEditorialDraftMutationSchema,
  careSeoEditorialTransitionMutationSchema,
  careSeoPublicPath,
  type CareArticleDetailDto,
  type CareSeoEditorialDraftMutation,
  type CareSeoEditorialRevisionDto,
  type CareSeoEditorialTransitionMutation,
  type CareSeoEditorialWorkspaceDto,
  type CareSeoHealthIndexEntryDto,
  type CareSeoProjectionDto,
  type SupportedLocale,
} from '../../../packages/contracts/src';
import { AquaGuideApiError } from '../api/api-client';
import { localBusinessAdminStore } from './local-business-admin.store';
import { isLocalAdminFileMode, persistLocalAdminPartition } from './local-file-persistence';

const STORAGE_KEY = 'aquaguide-local-care-seo-editorial-v1';
const now = () => new Date().toISOString();
const clone = <T>(value: T): T => structuredClone(value);
const makeId = () => globalThis.crypto?.randomUUID?.() || `00000000-0000-4000-8000-${Date.now().toString().padStart(12, '0').slice(-12)}`;

type LocalCareSeoState = {
  schemaVersion: 1;
  revisions: CareSeoEditorialRevisionDto[];
  updatedAt: string;
};

const seedState = (): LocalCareSeoState => ({ schemaVersion: 1, revisions: [], updatedAt: now() });
const readState = (): LocalCareSeoState => {
  if (typeof window === 'undefined') return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = seedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return state;
    }
    const parsed = JSON.parse(raw) as LocalCareSeoState;
    if (parsed?.schemaVersion !== 1 || !Array.isArray(parsed.revisions)) throw new Error('invalid local Care SEO store');
    return parsed;
  } catch (error) {
    if (isLocalAdminFileMode) {
      throw new AquaGuideApiError(409, 'MIGRATION_REJECTED', 'Local Care SEO 文件状态无效；为避免覆盖 Editorial revision，已停止使用 seed 回退。');
    }
    const state = seedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }
};
const writeState = async (state: LocalCareSeoState) => {
  state.updatedAt = now();
  if (isLocalAdminFileMode) {
    await persistLocalAdminPartition('care-seo', state);
    if (typeof window !== 'undefined') {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (error) { console.warn('[local-admin-cache] Care SEO state persisted to file but browser cache update failed.', error); }
    }
    return;
  }
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const compact = (value: string) => value.replace(/\s+/g, ' ').trim();
const truncate = (value: string, limit: number) => {
  const text = compact(value);
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
};

const requireLocalLocale = (locale: SupportedLocale) => {
  if (locale !== 'zh-CN') {
    throw new AquaGuideApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Local Mode 尚未接入 English Published Care source；不会用中文 Care 冒充英文 SEO source。');
  }
};

const buildProjection = (
  detail: CareArticleDetailDto,
  sourceVersion: number,
  publishedAt: string,
  locale: SupportedLocale,
): CareSeoProjectionDto => {
  requireLocalLocale(locale);
  const immediateActions = detail.steps.filter(step => step.actionKind === 'immediate').map(step => step.actionTitle || step.instruction);
  const candidateUrl = careSeoPublicPath(detail.catalogKey, locale);
  return {
    sourceCareId: detail.id,
    sourceCareCatalogKey: detail.catalogKey,
    sourceCareVersion: sourceVersion,
    sourcePublishedAt: publishedAt,
    sourceAuthority: 'publication-snapshot',
    locale,
    route: {
      pathname: candidateUrl,
      topicParam: detail.catalogKey,
      candidateUrl,
      alternates: buildCareSeoAlternates(detail.catalogKey),
      readiness: 'blocked',
      blockers: [
        'Local Care SEO Editorial 必须绑定当前 Published Care snapshot。',
        'Approved 只代表本地人工审核完成；Production / Index 继续锁定。',
      ],
    },
    sourceFacts: {
      title: detail.title, category: detail.category, urgency: detail.urgency, summary: detail.summary,
      symptoms: [...detail.symptoms], immediateActions, avoidActions: [...detail.avoidActions],
      observeItems: [...detail.observeItems], diagnoseWhen: [...detail.diagnoseWhen], nextStep: detail.nextStep,
      evidenceCount: detail.references.length,
    },
    suggestedEditorial: {
      seoTitle: truncate(`${detail.title} | AquaGuide`, 60), metaDescription: truncate(detail.summary, 160),
      h1: detail.title, focusKeyword: detail.keywords[0] || detail.title,
    },
    editableFields: ['seoTitle', 'metaDescription', 'h1', 'focusKeyword'],
    protectedSourceFields: ['title', 'category', 'urgency', 'summary', 'symptoms', 'steps', 'avoidActions', 'observeItems', 'diagnoseWhen', 'nextStep', 'references'],
    publishReady: false,
  };
};

const getProjection = async (id: string, locale: SupportedLocale): Promise<CareSeoProjectionDto> => {
  requireLocalLocale(locale);
  const source = await localBusinessAdminStore.getPublishedCareSeoSource(id);
  if (!source) throw new AquaGuideApiError(404, 'NOT_FOUND', '这条 Care 尚未有 Local Published snapshot，不能生成 SEO projection。');
  return buildProjection(source.detail, source.sourceVersion, source.publishedAt, locale);
};

const withDrift = (revision: CareSeoEditorialRevisionDto, currentVersion: number): CareSeoEditorialRevisionDto => ({
  ...clone(revision), sourceDrift: revision.sourceCareVersion !== currentVersion,
});
const latestRevision = (state: LocalCareSeoState, sourceCareId: string, locale: SupportedLocale) => (
  state.revisions.filter(item => item.sourceCareId === sourceCareId && item.locale === locale)
    .sort((a, b) => b.sourceCareVersion - a.sourceCareVersion || b.revisionNumber - a.revisionNumber)[0] || null
);

const getWorkspace = async (id: string, locale: SupportedLocale): Promise<CareSeoEditorialWorkspaceDto> => {
  const projection = await getProjection(id, locale);
  const state = readState();
  const editorial = latestRevision(state, projection.sourceCareId, locale);
  return { projection, editorial: editorial ? withDrift(editorial, projection.sourceCareVersion) : null, persistenceAvailable: true };
};

const assertCurrentSource = (projection: CareSeoProjectionDto, input: { sourceCareVersion: number; locale: SupportedLocale }) => {
  if (projection.sourceCareVersion !== input.sourceCareVersion || projection.locale !== input.locale) {
    throw new AquaGuideApiError(409, 'VERSION_CONFLICT', 'Published Care 已更新；请重新载入并基于最新版本创建 SEO Draft。');
  }
};
const assertNoindex = (value: string) => {
  if (value !== 'noindex') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', 'Local Care SEO 仍锁定 noindex；不能解锁 Production Index。');
};

const saveDraft = async (id: string, raw: CareSeoEditorialDraftMutation): Promise<CareSeoEditorialWorkspaceDto> => {
  const input = careSeoEditorialDraftMutationSchema.parse(raw);
  const projection = await getProjection(id, input.locale);
  assertCurrentSource(projection, input);
  assertNoindex(input.indexStrategy);
  const state = readState();
  if (input.editorialId && input.revisionVersion) {
    const index = state.revisions.findIndex(item => item.id === input.editorialId && item.sourceCareId === projection.sourceCareId);
    if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '没有找到 Local Care SEO Draft。');
    const current = state.revisions[index];
    if (current.reviewState !== 'draft') throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '只有 Draft 状态可以继续编辑。');
    if (current.sourceCareVersion !== projection.sourceCareVersion || current.locale !== input.locale) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '这份 SEO Draft 已发生 source drift；请基于最新 Published Care 新建 Draft。');
    if (current.version !== input.revisionVersion) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', 'SEO Draft 已被更新，请刷新后重试。');
    state.revisions[index] = { ...current, seoTitle: input.seoTitle, metaDescription: input.metaDescription, h1: input.h1, focusKeyword: input.focusKeyword, indexStrategy: 'noindex', version: current.version + 1, updatedAt: now(), sourceDrift: false };
    await writeState(state);
    return getWorkspace(id, input.locale);
  }
  const sameSource = state.revisions.filter(item => item.sourceCareId === projection.sourceCareId && item.locale === input.locale && item.sourceCareVersion === projection.sourceCareVersion);
  if (sameSource.some(item => item.reviewState === 'draft' || item.reviewState === 'ready_for_review')) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', '当前 Published Care 版本已有进行中的 SEO revision，请先刷新。');
  const createdAt = now();
  const revision: CareSeoEditorialRevisionDto = {
    id: makeId(), sourceCareId: projection.sourceCareId, sourceCareCatalogKey: projection.sourceCareCatalogKey,
    sourceCareVersion: projection.sourceCareVersion, locale: input.locale,
    revisionNumber: Math.max(0, ...sameSource.map(item => item.revisionNumber)) + 1,
    version: 1, reviewState: 'draft', indexStrategy: 'noindex', seoTitle: input.seoTitle,
    metaDescription: input.metaDescription, h1: input.h1, focusKeyword: input.focusKeyword,
    sourceDrift: false, createdAt, updatedAt: createdAt,
  };
  state.revisions.unshift(revision); await writeState(state);
  return getWorkspace(id, input.locale);
};

const transition = async (id: string, raw: CareSeoEditorialTransitionMutation, action: 'submit' | 'approve') => {
  const input = careSeoEditorialTransitionMutationSchema.parse(raw);
  const projection = await getProjection(id, input.locale);
  assertCurrentSource(projection, input);
  const state = readState();
  const index = state.revisions.findIndex(item => item.id === input.editorialId && item.sourceCareId === projection.sourceCareId);
  if (index < 0) throw new AquaGuideApiError(404, 'NOT_FOUND', '没有找到 Local Care SEO revision。');
  const current = state.revisions[index];
  if (current.version !== input.revisionVersion) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', 'SEO revision 已被更新，请刷新后重试。');
  if (current.sourceCareVersion !== projection.sourceCareVersion || current.locale !== input.locale) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', 'SEO revision 已发生 source drift，不能继续审核。');
  assertNoindex(current.indexStrategy);
  const expected = action === 'submit' ? 'draft' : 'ready_for_review';
  if (current.reviewState !== expected) throw new AquaGuideApiError(409, 'VERSION_CONFLICT', action === 'submit' ? '只有 Draft 可以提交审核。' : '只有待审核 revision 可以批准。');
  const timestamp = now();
  state.revisions[index] = {
    ...current,
    reviewState: action === 'submit' ? 'ready_for_review' : 'approved',
    version: current.version + 1,
    updatedAt: timestamp,
    ...(action === 'submit' ? { submittedAt: timestamp } : { approvedAt: timestamp }),
  };
  await writeState(state);
  return getWorkspace(id, input.locale);
};

const getHealthIndex = async (): Promise<CareSeoHealthIndexEntryDto[]> => {
  const sources = await localBusinessAdminStore.listPublishedCareSeoSources();
  const state = readState();
  return sources.flatMap(source => {
    const zh = latestRevision(state, source.detail.id, 'zh-CN');
    return [
      { sourceCareId: source.detail.id, sourceCareCatalogKey: source.detail.catalogKey, sourceCareVersion: source.sourceVersion, sourceAuthority: 'publication-snapshot' as const, locale: 'zh-CN' as const, persistenceAvailable: true, editorial: zh ? withDrift(zh, source.sourceVersion) : null },
      { sourceCareId: source.detail.id, sourceCareCatalogKey: source.detail.catalogKey, sourceCareVersion: source.sourceVersion, sourceAuthority: 'publication-snapshot' as const, locale: 'en' as const, persistenceAvailable: false, editorial: null },
    ];
  });
};

export const localCareSeoEditorialStore = {
  getProjection,
  getWorkspace,
  getHealthIndex,
  saveDraft,
  submitReview: (id: string, input: CareSeoEditorialTransitionMutation) => transition(id, input, 'submit'),
  approve: (id: string, input: CareSeoEditorialTransitionMutation) => transition(id, input, 'approve'),
  reset: () => { if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY); },
};
