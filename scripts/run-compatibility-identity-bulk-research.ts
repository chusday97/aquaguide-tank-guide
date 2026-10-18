import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fishData } from '../src/data/fishData';
import { createGbifSpeciesIdentityResolver } from '../src/services/compatibility/gbif-species-identity.service';
import {
  buildIdentityBulkPreparation,
  buildVariantResearchGroups,
  chooseVerifiedBaseResolution,
  selectIdentityResolutionWithVerifiedCache,
  type IdentityBulkBaseItem,
  type IdentityBulkQueueManifest,
  type IdentityResolutionLike,
} from '../src/services/compatibility/identity-bulk-research.service';

const arg = (name: string) => {
  const prefix = '--' + name + '=';
  return process.argv.find(value => value.startsWith(prefix))?.slice(prefix.length);
};

const queuePath = arg('queue') || 'evaluation/product/compatibility-identity-review-queue.v1.json';
const outputPath = arg('output') || 'evaluation/product/compatibility-identity-bulk-base-resolution.v1.json';
const resume = arg('resume') !== 'false';
const concurrency = Math.max(1, Math.min(12, Number(arg('concurrency') || 6)));
const queue = JSON.parse(readFileSync(queuePath, 'utf8')) as IdentityBulkQueueManifest;
const preparation = buildIdentityBulkPreparation(queue, fishData);
const resolver = createGbifSpeciesIdentityResolver();

const names = preparation.uniqueBaseCandidateNames;
const priorVerifiedByName = new Map<string, IdentityResolutionLike>();
if (resume && existsSync(outputPath)) {
  try {
    const previous = JSON.parse(readFileSync(outputPath, 'utf8')) as {
      items?: Array<{ baseResolution?: IdentityResolutionLike | null }>;
    };
    for (const item of previous.items || []) {
      const resolution = item.baseResolution;
      if (resolution?.status === 'verified') {
        priorVerifiedByName.set(resolution.queriedScientificName, resolution);
      }
    }
  } catch {
    // Ignore a malformed previous artifact and fail closed through the live resolver.
  }
}
const cachedVerifiedFallbackNames = new Set<string>();
const resolutions = new Map<string, IdentityResolutionLike>();
let cursor = 0;

const worker = async () => {
  while (true) {
    const index = cursor++;
    if (index >= names.length) return;
    const scientificName = names[index];
    const liveResolution = await resolver.resolve(scientificName);
    const cachedVerified = priorVerifiedByName.get(scientificName);
    const selected = selectIdentityResolutionWithVerifiedCache(liveResolution, cachedVerified);
    const resolution = selected.resolution;
    if (selected.usedCachedVerified) cachedVerifiedFallbackNames.add(scientificName);
    resolutions.set(scientificName, resolution);
    console.log(
      'IDENTITY_BULK_GBIF',
      index + 1,
      '/',
      names.length,
      scientificName,
      resolution.status,
      resolution.canonicalName || '',
      selected.usedCachedVerified ? 'cached_verified_fallback' : 'live',
    );
  }
};

await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(names.length, 1)) }, () => worker()));

const items: IdentityBulkBaseItem[] = preparation.items.map(item => {
  const baseResolution = chooseVerifiedBaseResolution(item.baseCandidateNames, resolutions);
  const selectedBaseScientificName = baseResolution?.status === 'verified'
    ? baseResolution.canonicalName || baseResolution.queriedScientificName
    : null;
  const stage: IdentityBulkBaseItem['stage'] = item.sourceQueue === 'taxonomic_review'
    ? 'taxonomy_review'
    : selectedBaseScientificName
      ? 'variant_identity_research'
      : 'parent_resolution_unresolved';

  return {
    ...item,
    selectedBaseScientificName,
    baseResolution,
    stage,
  };
});

const groups = buildVariantResearchGroups(items);
const report = {
  version: 1,
  kind: 'compatibility_identity_bulk_base_resolution',
  generatedAt: new Date().toISOString(),
  generatedFrom: queuePath,
  promotionAllowed: false,
  writesAuthority: false,
  summary: {
    totalAutomatedItems: items.length,
    uniqueBaseCandidateNames: names.length,
    gbifVerifiedBaseTaxa: [...resolutions.values()].filter(item => item.status === 'verified').length,
    gbifUnresolvedOrAmbiguousBaseTaxa: [...resolutions.values()].filter(item => item.status !== 'verified').length,
    cachedVerifiedFallbacks: cachedVerifiedFallbackNames.size,
    itemsWithVerifiedBase: items.filter(item => item.baseResolution?.status === 'verified').length,
    itemsWithoutVerifiedBase: items.filter(item => item.baseResolution?.status !== 'verified').length,
    variantResearchGroups: groups.length,
    variantResearchObjects: groups.reduce((sum, group) => sum + group.objects.length, 0),
    taxonomyReviewObjects: items.filter(item => item.stage === 'taxonomy_review').length,
  },
  items,
  groups,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output: outputPath, ...report.summary, promotionAllowed: false, writesAuthority: false }, null, 2));
