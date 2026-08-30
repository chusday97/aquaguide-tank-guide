import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { catalogManifestSchema, catalogSnapshotSchema, type CatalogSnapshot } from '../packages/contracts/src';

const version = process.env.CATALOG_VERSION || 'local-fish-data-v1';
const root = process.env.CATALOG_OUTPUT_DIR || 'build/catalog/releases';
const releaseDir = join(root, version);

const stablePayload = (snapshot: CatalogSnapshot) => ({
  ...snapshot,
  manifest: { ...snapshot.manifest, checksumSha256: '' },
});

const checksum = (snapshot: CatalogSnapshot) => createHash('sha256')
  .update(JSON.stringify(stablePayload(snapshot)))
  .digest('hex');

const snapshot = catalogSnapshotSchema.parse(JSON.parse(await readFile(join(releaseDir, 'catalog.snapshot.json'), 'utf8')));
const manifest = catalogManifestSchema.parse(JSON.parse(await readFile(join(releaseDir, 'catalog.manifest.json'), 'utf8')));
if (JSON.stringify(manifest) !== JSON.stringify(snapshot.manifest)) throw new Error('catalog manifest does not match snapshot manifest');
if (snapshot.manifest.speciesCount !== snapshot.species.length) throw new Error('catalog species count mismatch');
if (snapshot.manifest.reviewedProfileCount !== snapshot.compatibilityProfiles.filter(item => item.reviewStatus === 'reviewed').length) throw new Error('catalog profile count mismatch');
if (snapshot.manifest.reviewedPairRuleCount !== snapshot.pairRules.filter(item => item.reviewStatus === 'reviewed').length) throw new Error('catalog pair-rule count mismatch');

const speciesIds = new Set(snapshot.species.map(item => item.id));
const sourceIds = new Set(snapshot.evidenceSources.map(item => item.id));
if (speciesIds.size !== snapshot.species.length) throw new Error('catalog contains duplicate species IDs');
for (const profile of snapshot.compatibilityProfiles) {
  if (!speciesIds.has(profile.speciesId)) throw new Error(`profile references unknown species: ${profile.speciesId}`);
  if (profile.citationIds.some(id => !sourceIds.has(id))) throw new Error(`profile references unknown evidence source: ${profile.speciesId}`);
}
for (const rule of snapshot.pairRules) {
  if (rule.speciesIds.some(id => !speciesIds.has(String(id)))) throw new Error(`pair rule references unknown species: ${rule.speciesIds.join(',')}`);
  if (rule.citationIds.some(id => !sourceIds.has(id))) throw new Error(`pair rule references unknown evidence source: ${rule.speciesIds.join(',')}`);
}
const actual = checksum(snapshot);
if (actual !== snapshot.manifest.checksumSha256) throw new Error(`catalog checksum mismatch: ${actual} != ${snapshot.manifest.checksumSha256}`);
console.log(`catalog validation complete: ${snapshot.species.length} species, ${snapshot.evidenceSources.length} sources, checksum ${actual}`);
