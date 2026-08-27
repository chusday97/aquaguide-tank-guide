import { Router } from 'express';
import { catalogManifestSchema } from '../../../../packages/contracts/src';
import { apiConfig } from '../config';
import { ApiError, asyncRoute, sendData } from '../http';
import { getPublicSupabase } from '../supabase';

export const catalogRouter = Router();

catalogRouter.get('/catalog/releases/current', asyncRoute(async (request, response) => {
  const { data, error } = await getPublicSupabase()
    .from('catalog_releases')
    .select('version_key,schema_version,checksum_sha256,species_count,reviewed_profile_count,reviewed_pair_rule_count,published_at,storage_bucket,storage_path')
    .eq('status', 'published')
    .is('deleted_at', null)
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new ApiError(503, 'DEPENDENCY_UNAVAILABLE', 'Catalog 版本暂时无法加载。');
  if (!data) throw new ApiError(404, 'NOT_FOUND', '当前没有已发布的 Catalog 版本。');

  const storagePath = String(data.storage_path).split('/').map(encodeURIComponent).join('/');
  const snapshotUrl = `${apiConfig.supabaseUrl}/storage/v1/object/public/${encodeURIComponent(data.storage_bucket)}/${storagePath}`;
  const manifest = catalogManifestSchema.parse({
    version: data.version_key,
    schemaVersion: data.schema_version,
    checksumSha256: data.checksum_sha256,
    speciesCount: data.species_count,
    reviewedProfileCount: data.reviewed_profile_count,
    reviewedPairRuleCount: data.reviewed_pair_rule_count,
    publishedAt: data.published_at,
    snapshotUrl,
  });

  return sendData(request, response, manifest);
}));

