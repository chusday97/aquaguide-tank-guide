import type {
  CareArticleDetailDto,
  SpeciesDetailDto,
  SupportedLocale,
} from '../../../packages/contracts/src/index';
import { mapCareArticleDetail, mapSpeciesDetail } from './content-mappers';
import { ApiError } from './http';
import { getAdminSupabase } from './supabase';

type DbRow = Record<string, any>;
export type PublicationResourceType = 'species' | 'care';
export type PublicationSnapshotPayload = {
  'zh-CN': SpeciesDetailDto | CareArticleDetailDto;
  en: SpeciesDetailDto | CareArticleDetailDto;
};

export const speciesPublicationSelect = '*,species_translations(*),species_feeding_profiles(*,species_feeding_profile_translations(*)),species_assets(*),species_compatibility_profiles(*,species_compatibility_profile_sources(*,evidence_sources(*)))';
export const carePublicationSelect = '*,care_article_translations(*),care_article_steps(*,care_article_step_translations(*)),care_article_assets(*),care_article_reference_links(*,evidence_sources(*))';

export const buildPublicationSnapshot = (
  type: PublicationResourceType,
  row: DbRow,
): PublicationSnapshotPayload => (
  type === 'species'
    ? {
        'zh-CN': mapSpeciesDetail(row, 'zh-CN'),
        en: mapSpeciesDetail(row, 'en'),
      }
    : {
        'zh-CN': mapCareArticleDetail(row, 'zh-CN'),
        en: mapCareArticleDetail(row, 'en'),
      }
);
export const getLocalizedPublication = <T>(
  snapshot: PublicationSnapshotPayload | null | undefined,
  locale: SupportedLocale,
): T | null => {
  if (!snapshot) return null;
  return (snapshot[locale] || snapshot['zh-CN']) as T;
};

export const loadPublicationSource = async (
  type: PublicationResourceType,
  id: string,
): Promise<DbRow> => {
  const client = getAdminSupabase();
  const table = type === 'species' ? 'species' : 'care_articles';
  const select = type === 'species' ? speciesPublicationSelect : carePublicationSelect;
  const { data, error } = await client.from(table).select(select).eq('id', id).maybeSingle();
  if (error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '暂时无法读取待发布内容。');
  if (!data) throw new ApiError(404, 'NOT_FOUND', '没有找到需要发布的内容。');
  return data;
};

export const ensurePublishedSnapshotBeforeDraft = async (
  type: PublicationResourceType,
  id: string,
): Promise<DbRow> => {
  const client = getAdminSupabase();
  const source = await loadPublicationSource(type, id);
  if (source.status !== 'published') return source;

  const { data: existing, error: existingError } = await client
    .from('content_publications')
    .select('id')
    .eq('resource_type', type)
    .eq('resource_id', id)
    .maybeSingle();
  if (existingError) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '暂时无法核对已发布版本。');
  if (existing) return source;
  const { error: insertError } = await client.from('content_publications').insert({
    resource_type: type,
    resource_id: source.id,
    catalog_key: source.catalog_key,
    snapshot: buildPublicationSnapshot(type, source),
    source_version: source.version,
    published_at: source.published_at || new Date().toISOString(),
  });
  if (insertError) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '已发布版本保护失败，当前编辑未继续。');
  return source;
};

export const buildCurrentPublication = async (
  type: PublicationResourceType,
  id: string,
) => {
  const source = await loadPublicationSource(type, id);
  return {
    source,
    snapshot: buildPublicationSnapshot(type, source),
  };
};
