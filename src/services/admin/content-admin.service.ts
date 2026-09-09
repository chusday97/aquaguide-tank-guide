import type { z } from 'zod';
import {
  careArticleAdminInputSchema,
  speciesAdminInputSchema,
  type CareArticleDetailDto,
  type CareSeoAiAssistDto,
  type CareSeoAiAssistRequest,
  type CareSeoEditorialDraftMutation,
  type CareSeoEditorialTransitionMutation,
  type CareSeoEditorialWorkspaceDto,
  type CareSeoHealthIndexEntryDto,
  type CareSeoProjectionDto,
  type SpeciesDetailDto,
} from '../../../packages/contracts/src/index';
import {
  apiRequest,
  AquaGuideApiError,
  createIdempotencyKey,
  getApiAccessToken,
} from '../api/api-client';
import { isLocalBusinessAdminMode, localBusinessAdminStore } from './local-business-admin.store';
import { localCareSeoEditorialStore } from './local-care-seo-editorial.store';

export type SpeciesAdminInput = z.infer<typeof speciesAdminInputSchema>;
export type CareArticleAdminInput = z.infer<typeof careArticleAdminInputSchema>;

const publicContentOrNull = async <T>(path: string): Promise<T | null> => {
  try {
    return await apiRequest<T>(path, { authenticated: false });
  } catch (error) {
    if (error instanceof AquaGuideApiError && error.code === 'NOT_FOUND') return null;
    throw error;
  }
};


const adminContentOrNull = async <T>(path: string): Promise<T | null> => {
  try {
    return await apiRequest<T>(path);
  } catch (error) {
    if (error instanceof AquaGuideApiError && error.code === 'NOT_FOUND') return null;
    throw error;
  }
};

export type AdminAssetRecord = {
  id: string;
  variant: string;
  storageBucket: string;
  storagePath: string;
  assetVersion: number;
  isCurrent: boolean;
};

export type AdminSpeciesRecord = SpeciesAdminInput & {
  id: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  speciesAssets?: AdminAssetRecord[];
};

export type AdminCareArticleRecord = Omit<CareArticleAdminInput, 'steps'> & {
  id: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  careArticleSteps?: Array<{ id: string; position: number; instruction: string; durationLabel?: string; actionTitle?: string; actionKind?: 'immediate' | 'avoid' | 'observe' | 'recheck' }>;
  careArticleAssets?: AdminAssetRecord[];
};

const parseUploadResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json().catch(() => null) as {
    data?: T;
    error?: { code?: string; message?: string; details?: unknown };
    requestId?: string;
  } | null;
  if (!response.ok || !payload?.data) {
    throw new AquaGuideApiError(
      response.status,
      (payload?.error?.code as AquaGuideApiError['code']) || 'INTERNAL_ERROR',
      payload?.error?.message || '图片没有上传成功。',
      payload?.requestId,
      payload?.error?.details,
    );
  }
  return payload.data;
};

export const contentAdminService = {
  listSpecies: () => isLocalBusinessAdminMode ? localBusinessAdminStore.listSpecies() : apiRequest<AdminSpeciesRecord[]>('/admin/species'),
  listCareArticles: () => isLocalBusinessAdminMode ? localBusinessAdminStore.listCareArticles() : apiRequest<AdminCareArticleRecord[]>('/admin/care-articles'),
  getPublishedSpecies: (catalogKey: string) => isLocalBusinessAdminMode ? localBusinessAdminStore.getPublishedSpecies(catalogKey) : publicContentOrNull<SpeciesDetailDto>(`/species/${encodeURIComponent(catalogKey)}?locale=zh-CN`),
  getPublishedCareArticle: (catalogKey: string) => isLocalBusinessAdminMode ? localBusinessAdminStore.getPublishedCareArticle(catalogKey) : publicContentOrNull<CareArticleDetailDto>(`/care-articles/${encodeURIComponent(catalogKey)}?locale=zh-CN`),
  getCareSeoProjection: (id: string, locale: 'zh-CN' | 'en' = 'zh-CN') => isLocalBusinessAdminMode ? localCareSeoEditorialStore.getProjection(id, locale) : adminContentOrNull<CareSeoProjectionDto>(`/admin/care-articles/${encodeURIComponent(id)}/seo-projection?locale=${encodeURIComponent(locale)}`),
  getCareSeoHealthIndex: () => isLocalBusinessAdminMode ? localCareSeoEditorialStore.getHealthIndex() : apiRequest<CareSeoHealthIndexEntryDto[]>('/admin/care-seo-health'),

  getCareSeoEditorialWorkspace: (id: string, locale: 'zh-CN' | 'en' = 'zh-CN') => isLocalBusinessAdminMode ? localCareSeoEditorialStore.getWorkspace(id, locale) : adminContentOrNull<CareSeoEditorialWorkspaceDto>(`/admin/care-articles/${encodeURIComponent(id)}/seo-editorial?locale=${encodeURIComponent(locale)}`),
  getCareSeoAiAssist: (id: string, input: CareSeoAiAssistRequest) => isLocalBusinessAdminMode ? Promise.reject(new AquaGuideApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Local Mode AI Assist 尚未接入；不会伪造 AI 输出。')) : apiRequest<CareSeoAiAssistDto>(`/admin/care-articles/${encodeURIComponent(id)}/seo-editorial/ai-assist`, {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('admin-care-seo-ai-assist'),
  }),
  saveCareSeoEditorialDraft: (id: string, input: CareSeoEditorialDraftMutation) => isLocalBusinessAdminMode ? localCareSeoEditorialStore.saveDraft(id, input) : apiRequest<CareSeoEditorialWorkspaceDto>(`/admin/care-articles/${encodeURIComponent(id)}/seo-editorial/draft`, {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('admin-care-seo-draft'),
  }),
  submitCareSeoEditorialReview: (id: string, input: CareSeoEditorialTransitionMutation) => isLocalBusinessAdminMode ? localCareSeoEditorialStore.submitReview(id, input) : apiRequest<CareSeoEditorialWorkspaceDto>(`/admin/care-articles/${encodeURIComponent(id)}/seo-editorial/submit-review`, {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('admin-care-seo-submit'),
  }),
  approveCareSeoEditorial: (id: string, input: CareSeoEditorialTransitionMutation) => isLocalBusinessAdminMode ? localCareSeoEditorialStore.approve(id, input) : apiRequest<CareSeoEditorialWorkspaceDto>(`/admin/care-articles/${encodeURIComponent(id)}/seo-editorial/approve`, {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('admin-care-seo-approve'),
  }),

  createSpecies: (input: SpeciesAdminInput) => isLocalBusinessAdminMode ? localBusinessAdminStore.createSpecies(input) : apiRequest<AdminSpeciesRecord>('/admin/species', {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('admin-species-create'),
  }),

  updateSpecies: (id: string, version: number, input: SpeciesAdminInput) => isLocalBusinessAdminMode ? localBusinessAdminStore.updateSpecies(id, version, input) : apiRequest<AdminSpeciesRecord>(`/admin/species/${id}`, {
    method: 'PATCH',
    body: { ...input, version },
    idempotencyKey: createIdempotencyKey('admin-species-update'),
  }),

  createCareArticle: (input: CareArticleAdminInput) => isLocalBusinessAdminMode ? localBusinessAdminStore.createCareArticle(input) : apiRequest<AdminCareArticleRecord>('/admin/care-articles', {
    method: 'POST',
    body: input,
    idempotencyKey: createIdempotencyKey('admin-care-create'),
  }),

  updateCareArticle: (id: string, version: number, input: CareArticleAdminInput) => isLocalBusinessAdminMode ? localBusinessAdminStore.updateCareArticle(id, version, input) : apiRequest<AdminCareArticleRecord>(`/admin/care-articles/${id}`, {
    method: 'PATCH',
    body: { ...input, version },
    idempotencyKey: createIdempotencyKey('admin-care-update'),
  }),

  setStatus: (type: 'species' | 'care', id: string, version: number, status: 'published' | 'archived') => (
    isLocalBusinessAdminMode ? localBusinessAdminStore.setStatus(type, id, version, status) : apiRequest<AdminSpeciesRecord | AdminCareArticleRecord>(`/admin/content/${type}/${id}/${status === 'published' ? 'publish' : 'archive'}`, {
      method: 'POST',
      body: { version },
      idempotencyKey: createIdempotencyKey(`admin-${status}`),
    })
  ),

  async uploadAsset(type: 'species' | 'care', contentId: string, file: File, stepId?: string) {
    const query = new URLSearchParams({ contentType: type, contentId, fileName: file.name });
    if (stepId) query.set('stepId', stepId);
    let response: Response;
    try {
      response = await fetch(`/api/v1/admin/assets?${query}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getApiAccessToken()}`,
          'Content-Type': file.type,
          'Idempotency-Key': createIdempotencyKey('admin-asset'),
        },
        body: file,
      });
    } catch {
      throw new AquaGuideApiError(0, 'DEPENDENCY_UNAVAILABLE', '网络连接失败，图片没有上传。');
    }
    return parseUploadResponse<AdminAssetRecord[]>(response);
  },
};
