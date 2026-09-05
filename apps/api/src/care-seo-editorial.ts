import {
  type CareArticleDetailDto,
  type CareSeoEditorialDraftMutation,
  type CareSeoEditorialRevisionDto,
  type CareSeoEditorialTransitionMutation,
  type CareSeoEditorialWorkspaceDto,
  type CareSeoProjectionDto,
  type SupportedLocale,
} from '../../../packages/contracts/src/index';
import { buildCareSeoProjection } from './care-seo-projection';
import { carePublicationSelect, getLocalizedPublication } from './content-publications';
import { mapCareArticleDetail } from './content-mappers';
import { throwDatabaseError } from './data-utils';
import { ApiError } from './http';
import { getAdminSupabase } from './supabase';

const publicationStoreUnavailable = (error: { code?: string; message?: string } | null) => (
  ['42P01', 'PGRST205'].includes(String(error?.code || ''))
  || (/content_publications/i.test(String(error?.message || ''))
    && /not found|does not exist|schema cache/i.test(String(error?.message || '')))
);

const editorialStoreUnavailable = (error: { code?: string; message?: string } | null) => (
  ['42P01', 'PGRST205'].includes(String(error?.code || ''))
  || (/care_seo_editorial_revisions/i.test(String(error?.message || ''))
    && /not found|does not exist|schema cache/i.test(String(error?.message || '')))
);

type EditorialRow = {
  id: string;
  source_care_id: string;
  source_care_catalog_key: string;
  source_care_version: number;
  locale: SupportedLocale;
  revision_number: number;
  version: number;
  review_state: CareSeoEditorialRevisionDto['reviewState'];
  index_strategy: CareSeoEditorialRevisionDto['indexStrategy'];
  seo_title: string;
  meta_description: string;
  h1: string;
  focus_keyword: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  approved_at?: string | null;
};

const mapEditorial = (row: EditorialRow, currentSourceVersion: number): CareSeoEditorialRevisionDto => ({
  id: row.id,
  sourceCareId: row.source_care_id,
  sourceCareCatalogKey: row.source_care_catalog_key,
  sourceCareVersion: row.source_care_version,
  locale: row.locale,
  revisionNumber: row.revision_number,
  version: row.version,
  reviewState: row.review_state,
  indexStrategy: row.index_strategy,
  seoTitle: row.seo_title,
  metaDescription: row.meta_description,
  h1: row.h1,
  focusKeyword: row.focus_keyword,
  sourceDrift: row.source_care_version !== currentSourceVersion,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  ...(row.submitted_at ? { submittedAt: row.submitted_at } : {}),
  ...(row.approved_at ? { approvedAt: row.approved_at } : {}),
});

export const getCurrentCareSeoProjection = async (
  id: string,
  locale: SupportedLocale,
): Promise<CareSeoProjectionDto> => {
  const client = getAdminSupabase();
  const { data: publication, error: publicationError } = await client
    .from('content_publications')
    .select('snapshot,source_version,published_at')
    .eq('resource_type', 'care')
    .eq('resource_id', id)
    .maybeSingle();
  if (publicationError && !publicationStoreUnavailable(publicationError)) {
    throwDatabaseError(publicationError, '暂时无法读取 Care 已发布版本。');
  }
  if (publication) {
    const detail = getLocalizedPublication<CareArticleDetailDto>(publication.snapshot, locale);
    if (!detail) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Care 已发布快照缺少可用语言版本。');
    return buildCareSeoProjection(detail, publication.source_version, publication.published_at, 'publication-snapshot', locale);
  }

  const { data: legacy, error: legacyError } = await client
    .from('care_articles')
    .select(carePublicationSelect)
    .eq('id', id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();
  if (legacyError) throwDatabaseError(legacyError, '暂时无法读取 Care 已发布版本。');
  if (!legacy) throw new ApiError(404, 'NOT_FOUND', '这条 Care 尚未有 Published 版本，不能生成 SEO projection。');
  const detail = mapCareArticleDetail(legacy, locale);
  return buildCareSeoProjection(detail, legacy.version, legacy.published_at || legacy.updated_at, 'legacy-published', locale);
};

export const getCareSeoEditorialWorkspace = async (
  id: string,
  locale: SupportedLocale,
): Promise<CareSeoEditorialWorkspaceDto> => {
  const projection = await getCurrentCareSeoProjection(id, locale);
  const client = getAdminSupabase();
  const { data, error } = await client
    .from('care_seo_editorial_revisions')
    .select('*')
    .eq('source_care_id', id)
    .eq('locale', locale)
    .order('source_care_version', { ascending: false })
    .order('revision_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && editorialStoreUnavailable(error)) {
    return { projection, editorial: null, persistenceAvailable: false };
  }
  if (error) throwDatabaseError(error, '暂时无法读取 Care SEO Editorial。');
  return {
    projection,
    editorial: data ? mapEditorial(data as EditorialRow, projection.sourceCareVersion) : null,
    persistenceAvailable: true,
  };
};

const assertCurrentSource = (
  projection: CareSeoProjectionDto,
  input: { sourceCareVersion: number; locale: SupportedLocale },
) => {
  if (projection.sourceCareVersion !== input.sourceCareVersion || projection.locale !== input.locale) {
    throw new ApiError(409, 'VERSION_CONFLICT', 'Published Care 已更新；请重新载入并基于最新版本创建 SEO Draft。');
  }
};

const assertIndexLocked = (indexStrategy: string) => {
  if (indexStrategy !== 'noindex') {
    throw new ApiError(409, 'VERSION_CONFLICT', 'Care SEO Index 仍锁定；Hosted Staging acceptance 完成前只能使用 noindex。');
  }
};

const requireEditorialStore = (error: { code?: string; message?: string } | null) => {
  if (editorialStoreUnavailable(error)) {
    throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Care SEO Editorial migration 尚未部署到当前环境。');
  }
};

export const saveCareSeoEditorialDraft = async (
  id: string,
  input: CareSeoEditorialDraftMutation,
  actorId: string,
): Promise<CareSeoEditorialWorkspaceDto> => {
  const projection = await getCurrentCareSeoProjection(id, input.locale);
  assertCurrentSource(projection, input);
  assertIndexLocked(input.indexStrategy);
  const client = getAdminSupabase();

  if (input.editorialId && input.revisionVersion) {
    const { data: current, error: currentError } = await client
      .from('care_seo_editorial_revisions')
      .select('*')
      .eq('id', input.editorialId)
      .eq('source_care_id', id)
      .maybeSingle();
    requireEditorialStore(currentError);
    if (currentError) throwDatabaseError(currentError, '暂时无法读取 Care SEO Draft。');
    if (!current) throw new ApiError(404, 'NOT_FOUND', '没有找到 Care SEO Draft。');
    const row = current as EditorialRow;
    if (row.review_state !== 'draft') throw new ApiError(409, 'VERSION_CONFLICT', '只有 Draft 状态可以继续编辑。');
    if (row.source_care_version !== projection.sourceCareVersion || row.locale !== input.locale) {
      throw new ApiError(409, 'VERSION_CONFLICT', '这份 SEO Draft 已发生 source drift；请基于最新 Published Care 新建 Draft。');
    }
    if (row.version !== input.revisionVersion) throw new ApiError(409, 'VERSION_CONFLICT', 'SEO Draft 已被更新，请刷新后重试。');
    const { data: updated, error } = await client
      .from('care_seo_editorial_revisions')
      .update({
        seo_title: input.seoTitle,
        meta_description: input.metaDescription,
        h1: input.h1,
        focus_keyword: input.focusKeyword,
        index_strategy: input.indexStrategy,
        updated_by: actorId,
        updated_at: new Date().toISOString(),
        version: row.version + 1,
      })
      .eq('id', row.id)
      .eq('version', input.revisionVersion)
      .eq('review_state', 'draft')
      .select('id')
      .maybeSingle();
    if (error) throwDatabaseError(error, 'Care SEO Draft 没有保存成功。');
    if (!updated) throw new ApiError(409, 'VERSION_CONFLICT', 'SEO Draft 已被更新，请刷新后重试。');
    return getCareSeoEditorialWorkspace(id, input.locale);
  }

  const { data: latest, error: latestError } = await client
    .from('care_seo_editorial_revisions')
    .select('revision_number,review_state')
    .eq('source_care_id', id)
    .eq('source_care_version', projection.sourceCareVersion)
    .eq('locale', input.locale)
    .order('revision_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  requireEditorialStore(latestError);
  if (latestError) throwDatabaseError(latestError, '暂时无法核对 Care SEO revision。');
  if (latest?.review_state === 'draft' || latest?.review_state === 'ready_for_review') {
    throw new ApiError(409, 'VERSION_CONFLICT', '当前 Published Care 版本已有进行中的 SEO revision，请先刷新。');
  }
  const revisionNumber = Number(latest?.revision_number || 0) + 1;
  const { error } = await client.from('care_seo_editorial_revisions').insert({
    source_care_id: id,
    source_care_catalog_key: projection.sourceCareCatalogKey,
    source_care_version: projection.sourceCareVersion,
    locale: input.locale,
    revision_number: revisionNumber,
    review_state: 'draft',
    index_strategy: input.indexStrategy,
    seo_title: input.seoTitle,
    meta_description: input.metaDescription,
    h1: input.h1,
    focus_keyword: input.focusKeyword,
    created_by: actorId,
    updated_by: actorId,
  });
  if (error) throwDatabaseError(error, 'Care SEO Draft 没有创建成功。');
  return getCareSeoEditorialWorkspace(id, input.locale);
};

const transitionCareSeoEditorial = async (
  id: string,
  input: CareSeoEditorialTransitionMutation,
  actorId: string,
  action: 'submit' | 'approve',
): Promise<CareSeoEditorialWorkspaceDto> => {
  const projection = await getCurrentCareSeoProjection(id, input.locale);
  assertCurrentSource(projection, input);
  const client = getAdminSupabase();
  const { data: current, error: currentError } = await client
    .from('care_seo_editorial_revisions')
    .select('*')
    .eq('id', input.editorialId)
    .eq('source_care_id', id)
    .maybeSingle();
  requireEditorialStore(currentError);
  if (currentError) throwDatabaseError(currentError, '暂时无法读取 Care SEO revision。');
  if (!current) throw new ApiError(404, 'NOT_FOUND', '没有找到 Care SEO revision。');
  const row = current as EditorialRow;
  if (row.version !== input.revisionVersion) throw new ApiError(409, 'VERSION_CONFLICT', 'SEO revision 已被更新，请刷新后重试。');
  if (row.source_care_version !== projection.sourceCareVersion || row.locale !== input.locale) {
    throw new ApiError(409, 'VERSION_CONFLICT', 'SEO revision 已发生 source drift，不能继续审核。');
  }
  assertIndexLocked(row.index_strategy);
  const expectedState = action === 'submit' ? 'draft' : 'ready_for_review';
  if (row.review_state !== expectedState) {
    throw new ApiError(409, 'VERSION_CONFLICT', action === 'submit' ? '只有 Draft 可以提交审核。' : '只有待审核 revision 可以批准。');
  }
  const now = new Date().toISOString();
  const updates = action === 'submit'
    ? { review_state: 'ready_for_review', submitted_by: actorId, submitted_at: now, updated_by: actorId, updated_at: now, version: row.version + 1 }
    : { review_state: 'approved', approved_by: actorId, approved_at: now, updated_by: actorId, updated_at: now, version: row.version + 1 };
  const { data: updated, error } = await client
    .from('care_seo_editorial_revisions')
    .update(updates)
    .eq('id', row.id)
    .eq('version', row.version)
    .eq('review_state', expectedState)
    .select('id')
    .maybeSingle();
  if (error) throwDatabaseError(error, action === 'submit' ? 'Care SEO revision 没有提交审核。' : 'Care SEO revision 没有批准成功。');
  if (!updated) throw new ApiError(409, 'VERSION_CONFLICT', 'SEO revision 已被更新，请刷新后重试。');
  return getCareSeoEditorialWorkspace(id, input.locale);
};

export const submitCareSeoEditorialReview = (id: string, input: CareSeoEditorialTransitionMutation, actorId: string) => (
  transitionCareSeoEditorial(id, input, actorId, 'submit')
);

export const approveCareSeoEditorial = (id: string, input: CareSeoEditorialTransitionMutation, actorId: string) => (
  transitionCareSeoEditorial(id, input, actorId, 'approve')
);
