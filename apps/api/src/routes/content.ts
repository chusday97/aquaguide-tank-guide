import { Router } from 'express';
import {
  careArticleListQuerySchema,
  catalogKeySchema,
  speciesListQuerySchema,
  supportedLocaleSchema,
} from '../../../../packages/contracts/src/index';
import { mapCareArticleDetail, mapCareArticleSummary, mapSpeciesDetail, mapSpeciesSummary } from '../content-mappers';
import { getLocalizedPublication, type PublicationSnapshotPayload } from '../content-publications';
import { ApiError, asyncRoute, sendData } from '../http';
import { getPublicSupabase } from '../supabase';

const decodeCursor = (cursor?: string) => {
  if (!cursor) return 0;
  try {
    const value = Number(Buffer.from(cursor, 'base64url').toString('utf8'));
    if (!Number.isInteger(value) || value < 0) throw new Error('invalid cursor');
    return value;
  } catch {
    throw new ApiError(400, 'VALIDATION_ERROR', '分页位置无效。');
  }
};

const encodeCursor = (offset: number) => Buffer.from(String(offset), 'utf8').toString('base64url');

type PublicationRow = { catalog_key: string; snapshot: PublicationSnapshotPayload };

const toSpeciesSummary = (detail: any) => ({
  id: detail.id,
  catalogKey: detail.catalogKey,
  name: detail.name,
  scientificName: detail.scientificName,
  category: detail.category,
  difficulty: detail.difficulty,
  waterTemperatureText: detail.waterTemperatureText,
  phLevelText: detail.phLevelText,
  temperament: detail.temperament,
  sizeClass: detail.sizeClass,
  thumbnail: detail.thumbnail,
  updatedAt: detail.updatedAt,
  localization: detail.localization,
});

const toCareSummary = (detail: any) => ({
  id: detail.id,
  catalogKey: detail.catalogKey,
  title: detail.title,
  category: detail.category,
  urgency: detail.urgency,
  summary: detail.summary,
  keywords: detail.keywords,
  image: detail.image,
  updatedAt: detail.updatedAt,
  localization: detail.localization,
});

const normalizedIncludes = (value: unknown, query: string) => (
  String(value || '').toLocaleLowerCase().includes(query.toLocaleLowerCase())
);

const isPublicationStoreNotMigrated = (error: any) => (
  ['42P01', 'PGRST205'].includes(String(error?.code || ''))
  || /content_publications/i.test(String(error?.message || '')) && /not found|does not exist|schema cache/i.test(String(error?.message || ''))
);

const loadPublications = async (type: 'species' | 'care') => {
  const client = getPublicSupabase();
  const { data, error } = await client
    .from('content_publications')
    .select('catalog_key,snapshot')
    .eq('resource_type', type)
    .order('catalog_key');
  if (error && isPublicationStoreNotMigrated(error)) return [];
  if (error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '已发布内容快照暂时无法加载。');
  return (data || []) as PublicationRow[];
};

const loadPublicationByCatalogKey = async (type: 'species' | 'care', catalogKey: string) => {
  const client = getPublicSupabase();
  const { data, error } = await client
    .from('content_publications')
    .select('snapshot')
    .eq('resource_type', type)
    .eq('catalog_key', catalogKey)
    .maybeSingle();
  if (error && isPublicationStoreNotMigrated(error)) return null;
  if (error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '已发布内容快照暂时无法加载。');
  return data?.snapshot as PublicationSnapshotPayload | undefined;
};

export const contentRouter = Router();

contentRouter.get('/content-bootstrap', asyncRoute(async (request, response) => {
  const localeParsed = supportedLocaleSchema.safeParse(request.query.locale || 'zh-CN');
  if (!localeParsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '语言参数无效。');
  const locale = localeParsed.data;
  const client = getPublicSupabase();

  const [speciesPublications, carePublications, legacySpeciesResult, legacyCareResult] = await Promise.all([
    loadPublications('species'),
    loadPublications('care'),
    client
      .from('species')
      .select('*,species_translations(*),species_feeding_profiles(*,species_feeding_profile_translations(*)),species_assets(*)')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('catalog_key'),
    client
      .from('care_articles')
      .select('*,care_article_translations(*),care_article_steps(*,care_article_step_translations(*)),care_article_assets(*),care_article_reference_links(*,evidence_sources(*))')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('catalog_key'),
  ]);

  if (legacySpeciesResult.error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '物种内容暂时无法加载。');
  if (legacyCareResult.error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '养护内容暂时无法加载。');

  const speciesPublicationKeys = new Set(speciesPublications.map(row => row.catalog_key));
  const carePublicationKeys = new Set(carePublications.map(row => row.catalog_key));
  const species = [
    ...speciesPublications.map(row => getLocalizedPublication<any>(row.snapshot, locale)).filter(Boolean),
    ...(legacySpeciesResult.data || [])
      .filter(row => !speciesPublicationKeys.has(row.catalog_key))
      .map(row => mapSpeciesDetail(row, locale)),
  ].sort((left, right) => left.catalogKey.localeCompare(right.catalogKey));
  const careArticles = [
    ...carePublications.map(row => getLocalizedPublication<any>(row.snapshot, locale)).filter(Boolean),
    ...(legacyCareResult.data || [])
      .filter(row => !carePublicationKeys.has(row.catalog_key))
      .map(row => mapCareArticleDetail(row, locale)),
  ].sort((left, right) => left.catalogKey.localeCompare(right.catalogKey));

  response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return sendData(request, response, {
    species,
    careArticles,
    authority: speciesPublications.length + carePublications.length > 0 ? 'publication-snapshot' : 'legacy-published',
    publicationCounts: { species: speciesPublications.length, care: carePublications.length },
  });
}));

contentRouter.get('/species', asyncRoute(async (request, response) => {
  const parsed = speciesListQuerySchema.safeParse(request.query);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '物种筛选条件无效。', parsed.error.flatten());
  const { limit, cursor, category, query, locale } = parsed.data;
  const offset = decodeCursor(cursor);
  const client = getPublicSupabase();

  const [{ data: legacyData, error: legacyError }, publications] = await Promise.all([
    client
      .from('species')
      .select('id,catalog_key,name,scientific_name,category,difficulty,water_temperature_text,ph_level_text,temperament,size_class,updated_at,species_assets(*),species_translations(*)')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('catalog_key'),
    loadPublications('species'),
  ]);
  if (legacyError) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '物种内容暂时无法加载。');

  const publicationKeys = new Set(publications.map(row => row.catalog_key));
  const publicationItems = publications
    .map(row => getLocalizedPublication<any>(row.snapshot, locale))
    .filter(Boolean)
    .map(toSpeciesSummary);
  const legacyItems = (legacyData || [])
    .filter(row => !publicationKeys.has(row.catalog_key))
    .map(row => mapSpeciesSummary(row, locale));

  const filtered = [...publicationItems, ...legacyItems]
    .filter(item => !category || item.category === category)
    .filter(item => !query || normalizedIncludes(`${item.name} ${item.scientificName} ${item.catalogKey}`, query))
    .sort((left, right) => left.catalogKey.localeCompare(right.catalogKey));
  const page = filtered.slice(offset, offset + limit + 1);
  const hasMore = page.length > limit;
  return sendData(request, response, {
    items: page.slice(0, limit),
    ...(hasMore ? { nextCursor: encodeCursor(offset + limit) } : {}),
  });
}));

contentRouter.get('/species/:catalogKey', asyncRoute(async (request, response) => {
  const parsed = catalogKeySchema.safeParse(request.params.catalogKey);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '物种标识无效。');
  const localeParsed = supportedLocaleSchema.safeParse(request.query.locale || 'zh-CN');
  if (!localeParsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '语言参数无效。');
  const client = getPublicSupabase();

  const publication = await loadPublicationByCatalogKey('species', parsed.data);
  if (publication) {
    const detail = getLocalizedPublication<any>(publication, localeParsed.data);
    if (detail) return sendData(request, response, detail);
  }

  const { data, error } = await client
    .from('species')
    .select('*,species_translations(*),species_feeding_profiles(*,species_feeding_profile_translations(*)),species_assets(*),species_compatibility_profiles(*,species_compatibility_profile_sources(*,evidence_sources(*)))')
    .eq('catalog_key', parsed.data)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '物种详情暂时无法加载。');
  if (!data) throw new ApiError(404, 'NOT_FOUND', '没有找到这个物种。');
  return sendData(request, response, mapSpeciesDetail(data, localeParsed.data));
}));

contentRouter.get('/care-articles', asyncRoute(async (request, response) => {
  const parsed = careArticleListQuerySchema.safeParse(request.query);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '养护筛选条件无效。', parsed.error.flatten());
  const { limit, cursor, category, urgency, query, locale } = parsed.data;
  const offset = decodeCursor(cursor);
  const client = getPublicSupabase();

  const [{ data: legacyData, error: legacyError }, publications] = await Promise.all([
    client
      .from('care_articles')
      .select('id,catalog_key,title,category,urgency,summary,keywords,updated_at,care_article_assets(*),care_article_translations(*)')
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('catalog_key'),
    loadPublications('care'),
  ]);
  if (legacyError) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '养护内容暂时无法加载。');

  const publicationKeys = new Set(publications.map(row => row.catalog_key));
  const publicationItems = publications
    .map(row => getLocalizedPublication<any>(row.snapshot, locale))
    .filter(Boolean)
    .map(toCareSummary);
  const legacyItems = (legacyData || [])
    .filter(row => !publicationKeys.has(row.catalog_key))
    .map(row => mapCareArticleSummary(row, locale));

  const filtered = [...publicationItems, ...legacyItems]
    .filter(item => !category || item.category === category)
    .filter(item => !urgency || item.urgency === urgency)
    .filter(item => !query || normalizedIncludes(`${item.title} ${item.summary} ${item.catalogKey}`, query))
    .sort((left, right) => left.catalogKey.localeCompare(right.catalogKey));
  const page = filtered.slice(offset, offset + limit + 1);
  const hasMore = page.length > limit;
  return sendData(request, response, {
    items: page.slice(0, limit),
    ...(hasMore ? { nextCursor: encodeCursor(offset + limit) } : {}),
  });
}));

contentRouter.get('/care-articles/:catalogKey', asyncRoute(async (request, response) => {
  const parsed = catalogKeySchema.safeParse(request.params.catalogKey);
  if (!parsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '文章标识无效。');
  const localeParsed = supportedLocaleSchema.safeParse(request.query.locale || 'zh-CN');
  if (!localeParsed.success) throw new ApiError(400, 'VALIDATION_ERROR', '语言参数无效。');
  const client = getPublicSupabase();

  const publication = await loadPublicationByCatalogKey('care', parsed.data);
  if (publication) {
    const detail = getLocalizedPublication<any>(publication, localeParsed.data);
    if (detail) return sendData(request, response, detail);
  }

  const { data, error } = await client
    .from('care_articles')
    .select('*,care_article_translations(*),care_article_steps(*,care_article_step_translations(*)),care_article_assets(*),care_article_reference_links(*,evidence_sources(*))')
    .eq('catalog_key', parsed.data)
    .eq('status', 'published')
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', '养护详情暂时无法加载。');
  if (!data) throw new ApiError(404, 'NOT_FOUND', '没有找到这篇养护文章。');
  return sendData(request, response, mapCareArticleDetail(data, localeParsed.data));
}));
