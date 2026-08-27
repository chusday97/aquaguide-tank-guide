import { catalogSnapshotSchema, type CatalogSnapshot, type CatalogManifest } from '../../../packages/contracts/src';
import { fishData } from '../../data/fishData';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile, getReviewedPairRule } from '../../data/compatibilityEvidence';
import type { Fish } from '../../types';

export const LOCAL_CATALOG_VERSION = 'local-fish-data-v1';
const LOCAL_SNAPSHOT_URL = `https://catalog.invalid/releases/${LOCAL_CATALOG_VERSION}/catalog.snapshot.json`;

export type CatalogLoadResult = {
  snapshot: CatalogSnapshot;
  source: 'local' | 'remote';
  fallbackReason?: 'manifest_unavailable' | 'manifest_invalid' | 'snapshot_invalid' | 'checksum_mismatch' | 'version_mismatch';
};

const nonEmpty = (value: string | undefined) => value?.trim() || null;

const toCatalogSpecies = (fish: Fish) => ({
  id: fish.id,
  catalogKey: fish.id,
  name: fish.name,
  scientificName: fish.scientificName,
  category: fish.category,
  // Fish has no reviewed, explicit water-type field yet. Unknown is intentional;
  // this adapter must not infer water type from names or category text.
  waterType: 'unknown' as const,
  difficulty: fish.difficulty,
  waterTemperatureText: nonEmpty(fish.waterTemperature),
  waterTemperatureMinC: null,
  waterTemperatureMaxC: null,
  phLevelText: nonEmpty(fish.phLevel),
  phMin: null,
  phMax: null,
  waterChangeCycleDays: Number.isFinite(fish.waterChangeCycle) && fish.waterChangeCycle > 0 ? fish.waterChangeCycle : null,
  description: nonEmpty(fish.description),
  diet: nonEmpty(fish.diet),
  tankSizeText: nonEmpty(fish.tankSize),
  minTankLiters: null,
  temperament: fish.temperament ?? null,
  sizeClass: fish.size ?? null,
  housingMode: fish.housingMode ?? null,
  housingReason: nonEmpty(fish.housingReason),
  completeness: 'unknown' as const,
  evidenceSourceIds: [],
});

const collectEvidenceSources = (profiles: ReturnType<typeof getReviewedCompatibilityProfile>[], pairRules: ReturnType<typeof getReviewedPairRule>[]) => {
  const byId = new Map<string, NonNullable<typeof profiles[number]>['citations'][number]>();
  for (const item of [...profiles, ...pairRules]) {
    for (const citation of item?.citations ?? []) byId.set(citation.id, citation);
  }
  return [...byId.values()].map(source => ({
    id: source.id,
    title: source.title,
    publisher: source.publisher,
    url: source.url,
    sourceType: source.sourceType,
    reviewStatus: source.reviewStatus,
  }));
};

const stablePayload = (snapshot: CatalogSnapshot) => ({
  ...snapshot,
  manifest: { ...snapshot.manifest, checksumSha256: '' },
});

const sha256 = async (value: unknown) => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export const buildLocalCatalogSnapshot = async (): Promise<CatalogSnapshot> => {
  const audit = getCompatibilityEvidenceAudit();
  const profiles = audit.reviewedSpeciesIds.map(id => getReviewedCompatibilityProfile(id)).filter(Boolean);
  const pairRules = audit.reviewedPairRules.map(rule => getReviewedPairRule(rule.speciesIds[0], rule.speciesIds[1])).filter(Boolean);
  const evidenceSources = collectEvidenceSources(profiles, pairRules);
  const snapshotWithoutChecksum: CatalogSnapshot = {
    manifest: {
      version: LOCAL_CATALOG_VERSION,
      schemaVersion: 1,
      checksumSha256: '',
      speciesCount: fishData.length,
      reviewedProfileCount: profiles.length,
      reviewedPairRuleCount: pairRules.length,
      publishedAt: '1970-01-01T00:00:00.000Z',
      snapshotUrl: LOCAL_SNAPSHOT_URL,
    },
    species: fishData.map(toCatalogSpecies),
    evidenceSources,
    compatibilityProfiles: profiles.map(profile => ({
      speciesId: profile!.speciesId,
      behaviorTraits: profile!.behaviorTraits,
      minimumGroupSize: profile!.minimumGroupSize ?? null,
      predationTargets: profile!.predationTargets,
      confidence: profile!.confidence,
      reviewStatus: profile!.reviewStatus,
      citationIds: profile!.citations.map(citation => citation.id),
    })),
    pairRules: pairRules.map(rule => ({
      speciesIds: [...rule!.speciesIds].sort() as [string, string],
      verdict: rule!.verdict,
      riskType: rule!.riskType,
      reason: rule!.reason,
      mitigation: rule!.mitigation,
      confidence: rule!.confidence,
      reviewStatus: rule!.reviewStatus,
      citationIds: rule!.citations.map(citation => citation.id),
    })),
  };
  const checksumSha256 = await sha256(stablePayload(snapshotWithoutChecksum));
  return catalogSnapshotSchema.parse({
    ...snapshotWithoutChecksum,
    manifest: { ...snapshotWithoutChecksum.manifest, checksumSha256 },
  });
};

const verifySnapshot = async (snapshot: CatalogSnapshot, manifest?: CatalogManifest) => {
  const parsed = catalogSnapshotSchema.parse(snapshot);
  if (manifest && parsed.manifest.version !== manifest.version) throw new Error('version_mismatch');
  if (parsed.manifest.speciesCount !== parsed.species.length) throw new Error('snapshot_invalid');
  if (parsed.manifest.reviewedProfileCount !== parsed.compatibilityProfiles.filter(item => item.reviewStatus === 'reviewed').length) throw new Error('snapshot_invalid');
  if (parsed.manifest.reviewedPairRuleCount !== parsed.pairRules.filter(item => item.reviewStatus === 'reviewed').length) throw new Error('snapshot_invalid');
  const checksum = await sha256(stablePayload(parsed));
  if (checksum.toLowerCase() !== parsed.manifest.checksumSha256.toLowerCase()) throw new Error('checksum_mismatch');
  return parsed;
};

export const loadCatalogSnapshot = async (options: { manifestUrl?: string; fetchImpl?: typeof fetch } = {}): Promise<CatalogLoadResult> => {
  const local = await buildLocalCatalogSnapshot();
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) return { snapshot: local, source: 'local', fallbackReason: 'manifest_unavailable' };
  try {
    const manifestResponse = await fetchImpl(options.manifestUrl ?? '/api/v1/catalog/releases/current');
    if (!manifestResponse.ok) return { snapshot: local, source: 'local', fallbackReason: 'manifest_unavailable' };
    const manifest = catalogSnapshotSchema.shape.manifest.parse(await manifestResponse.json());
    const snapshotResponse = await fetchImpl(manifest.snapshotUrl);
    if (!snapshotResponse.ok) return { snapshot: local, source: 'local', fallbackReason: 'snapshot_invalid' };
    const remote = await verifySnapshot(await snapshotResponse.json(), manifest);
    return { snapshot: remote, source: 'remote' };
  } catch (error) {
    const reason = error instanceof Error && ['version_mismatch', 'checksum_mismatch', 'snapshot_invalid'].includes(error.message)
      ? error.message as CatalogLoadResult['fallbackReason']
      : 'manifest_invalid';
    return { snapshot: local, source: 'local', fallbackReason: reason };
  }
};
