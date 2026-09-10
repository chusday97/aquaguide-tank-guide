import { getReviewedCompatibilityProfile } from './compatibilityEvidence';
import { fishData } from './fishData';
import { getSpeciesLandingPilotRecord } from './speciesLandingPilot';
import type {
  Fish,
  SeoEvidenceBinding,
  SeoEvidenceBindingStatus,
  SeoEvidenceSourceKind,
} from '../types';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export type SeoEvidenceManifestEntry = {
  binding: SeoEvidenceBinding;
  currentSnapshot: () => JsonValue;
  sourceReady: () => boolean;
  assetFile?: {
    path: string;
    sha256: string;
  };
};

const productTruthFields = [
  'id',
  'name',
  'scientificName',
  'category',
  'difficulty',
  'waterTemperature',
  'phLevel',
  'tankSize',
  'temperament',
  'size',
  'housingMode',
  'description',
  'diet',
] as const;

const stableStringify = (value: JsonValue): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
};

/** A small deterministic, dependency-free fingerprint for local source snapshots. */
export const fingerprintSeoEvidence = (snapshot: JsonValue): string => {
  let hash = 2166136261;
  for (const character of stableStringify(snapshot)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

const findFish = (speciesId: string) => fishData.find(fish => fish.id === speciesId);

export const getProductTruthSnapshot = (fish: Fish): JsonValue => (
  Object.fromEntries(productTruthFields.map(field => [field, fish[field]])) as JsonValue
);

export const getReviewedEvidenceSnapshot = (speciesId: string): JsonValue | null => {
  const profile = getReviewedCompatibilityProfile(speciesId);
  if (!profile) return null;
  return {
    speciesId: profile.speciesId,
    behaviorTraits: profile.behaviorTraits,
    minimumGroupSize: profile.minimumGroupSize ?? null,
    predationTargets: profile.predationTargets,
    confidence: profile.confidence,
    reviewStatus: profile.reviewStatus,
    citations: profile.citations.map(source => ({
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      sourceType: source.sourceType,
      reviewStatus: source.reviewStatus,
    })),
  };
};

const getAssetSnapshot = (speciesId: string, usage: 'hero' | 'variant-card'): JsonValue => {
  const fish = findFish(speciesId);
  if (!fish) return { speciesId, usage, missing: true };
  const pilot = getSpeciesLandingPilotRecord(fish);
  const source = usage === 'hero' ? pilot.asset.hero : pilot.asset.variantCard;
  return {
    speciesId,
    usage,
    status: source.status,
    sourcePath: source.sourcePath,
    use: source.use,
    crop: source.crop,
    altZh: source.altZh,
    altEn: source.altEn,
    fallbackLabelZh: pilot.asset.fallbackLabelZh,
    fallbackLabelEn: pilot.asset.fallbackLabelEn,
  };
};

const getAssetReady = (speciesId: string, usage: 'hero' | 'variant-card') => {
  const fish = findFish(speciesId);
  if (!fish) return false;
  const pilot = getSpeciesLandingPilotRecord(fish);
  const source = usage === 'hero' ? pilot.asset.hero : pilot.asset.variantCard;
  return source.status === 'approved' && Boolean(source.sourcePath);
};

const productTruthClaim = (fish: Fish) => `${fish.name} · ${fish.scientificName} · ${fish.waterTemperature} · ${fish.phLevel} · ${fish.tankSize}`;
const reviewedClaim = (speciesId: string) => {
  const profile = getReviewedCompatibilityProfile(speciesId);
  if (!profile) return '';
  const group = profile.minimumGroupSize ? `建议至少 ${profile.minimumGroupSize} 条` : '群体活动';
  return `群游倾向 · ${group} · 已核对资料将其记录为群游鱼；群体规模是理解其行为的前提。 · ${profile.citations.map(source => source.id).join('、')}`;
};

const productEntry = (fish: Fish, sourceFingerprint: string): SeoEvidenceManifestEntry => ({
  binding: {
    id: `${fish.id}:product-truth`,
    targetId: fish.id,
    field: 'catalog.summary',
    renderedClaim: productTruthClaim(fish),
    sourceKind: 'product-truth',
    sourceIds: [`fishData.ts:${fish.id}`],
    sourceFingerprint,
    status: 'confirmed',
    confirmedBy: 'AquaGuide Product Truth catalog',
    confirmedAt: '2026-08-31',
  },
  currentSnapshot: () => getProductTruthSnapshot(findFish(fish.id) || fish),
  sourceReady: () => Boolean(findFish(fish.id)),
});

const reviewedEvidenceEntry = (speciesId: string): SeoEvidenceManifestEntry => {
  const evidence = getReviewedCompatibilityProfile(speciesId);
  const sourceIds = evidence?.citations.map(source => source.id) || [];
  return {
    binding: {
      id: `${speciesId}:behavior.shoaling`,
      targetId: speciesId,
      field: 'reviewedTraits.shoaling',
      renderedClaim: reviewedClaim(speciesId),
      sourceKind: 'reviewed-evidence',
      sourceIds,
      sourceFingerprint: 'fnv1a32:5b03227e',
      status: 'confirmed',
      confirmedBy: 'AquaGuide reviewed evidence registry',
      confirmedAt: '2026-08-31',
    },
    currentSnapshot: () => getReviewedEvidenceSnapshot(speciesId) || { speciesId, missing: true },
    sourceReady: () => {
      const current = getReviewedCompatibilityProfile(speciesId);
      return Boolean(current && current.reviewStatus === 'reviewed' && current.citations.length > 0 && current.citations.every(source => source.reviewStatus === 'reviewed'));
    },
  };
};

const assetEntry = (
  speciesId: string,
  usage: 'hero' | 'variant-card',
  sha256: string,
  options: { sourceFingerprint: string; status?: SeoEvidenceBindingStatus; confirmedBy?: string; confirmedAt?: string },
): SeoEvidenceManifestEntry => {
  const fish = findFish(speciesId);
  const pilot = fish ? getSpeciesLandingPilotRecord(fish) : undefined;
  const source = pilot ? (usage === 'hero' ? pilot.asset.hero : pilot.asset.variantCard) : undefined;
  return {
    binding: {
      id: `${speciesId}:asset.${usage}`,
      targetId: speciesId,
      field: `assets.${usage}`,
      renderedClaim: source?.altZh || `${speciesId} ${usage}`,
      sourceKind: 'asset',
      sourceIds: source?.sourcePath ? [source.sourcePath] : [],
      sourceFingerprint: options.sourceFingerprint,
      status: options.status || 'confirmed',
      confirmedBy: options.confirmedBy || 'project-owner',
      confirmedAt: options.confirmedAt || '2026-09-01',
    },
    currentSnapshot: () => getAssetSnapshot(speciesId, usage),
    sourceReady: () => getAssetReady(speciesId, usage),
    assetFile: source?.sourcePath ? { path: source.sourcePath, sha256 } : undefined,
  };
};

export const seoEvidenceManifest: SeoEvidenceManifestEntry[] = [
  productEntry(findFish('sp_0001') as Fish, 'fnv1a32:7978a015'),
  productEntry(findFish('sp_0030') as Fish, 'fnv1a32:1b8de482'),
  productEntry(findFish('sp_0432') as Fish, 'fnv1a32:55246ea2'),
  reviewedEvidenceEntry('sp_0432'),
  assetEntry('sp_0001', 'hero', 'af044441e7c8facb4382964a4f97db50007f694d9844e9814012b3899d7f1b38', { sourceFingerprint: 'fnv1a32:96cefb53' }),
  assetEntry('sp_0001', 'variant-card', 'af044441e7c8facb4382964a4f97db50007f694d9844e9814012b3899d7f1b38', { sourceFingerprint: 'fnv1a32:e671126f' }),
  assetEntry('sp_0030', 'hero', '696670603f91edbb92bc51ceae72a5922eb8110094adad9484f5b670aecb6a9b', { sourceFingerprint: 'fnv1a32:0f89a14a' }),
  assetEntry('sp_0030', 'variant-card', '696670603f91edbb92bc51ceae72a5922eb8110094adad9484f5b670aecb6a9b', { sourceFingerprint: 'fnv1a32:1c7b8cf2' }),
  assetEntry('sp_0432', 'hero', '760692b8bb1aa527dbead2640660f118b47026b1097fb1c409075a6ecb6bc456', { sourceFingerprint: 'fnv1a32:7b5f6187', status: 'blocked', confirmedBy: 'pending-review', confirmedAt: '2026-09-10' }),
  assetEntry('sp_0432', 'variant-card', '760692b8bb1aa527dbead2640660f118b47026b1097fb1c409075a6ecb6bc456', { sourceFingerprint: 'fnv1a32:d3e50e53', status: 'blocked', confirmedBy: 'pending-review', confirmedAt: '2026-09-10' }),
];

export const getSeoEvidenceBindingStatus = (entry: SeoEvidenceManifestEntry): SeoEvidenceBindingStatus => {
  if (!entry.sourceReady()) return 'blocked';
  if (fingerprintSeoEvidence(entry.currentSnapshot()) !== entry.binding.sourceFingerprint) return 'stale';
  return entry.binding.status;
};

export const getCurrentSeoEvidenceBinding = (entry: SeoEvidenceManifestEntry): SeoEvidenceBinding => ({
  ...entry.binding,
  status: getSeoEvidenceBindingStatus(entry),
});

export const getSeoEvidenceReport = (targetId?: string) => seoEvidenceManifest
  .filter(entry => !targetId || entry.binding.targetId === targetId)
  .map(entry => ({
    ...getCurrentSeoEvidenceBinding(entry),
    currentFingerprint: fingerprintSeoEvidence(entry.currentSnapshot()),
  }));

export const getSeoEvidenceEntry = (targetId: string, field: string) => seoEvidenceManifest.find(entry => (
  entry.binding.targetId === targetId && entry.binding.field === field
));

export const isSeoEvidenceConfirmed = (targetId: string, field: string) => {
  const entry = getSeoEvidenceEntry(targetId, field);
  return Boolean(entry && getSeoEvidenceBindingStatus(entry) === 'confirmed');
};

export const getSeoAssetFileManifest = () => seoEvidenceManifest
  .filter(entry => entry.binding.sourceKind === 'asset' && entry.assetFile)
  .map(entry => ({
    bindingId: entry.binding.id,
    path: entry.assetFile!.path,
    sha256: entry.assetFile!.sha256,
  }));
