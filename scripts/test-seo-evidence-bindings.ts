import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  fingerprintSeoEvidence,
  getCurrentSeoEvidenceBinding,
  getReviewedEvidenceSnapshot,
  getSeoAssetFileManifest,
  getSeoEvidenceEntry,
  getSeoEvidenceReport,
  getSeoEvidenceBindingStatus,
} from '../src/data/seoEvidenceBindings';
import { getPublishedSpeciesProfile } from '../src/data/publishedSpeciesProfile';
import { getSpeciesLandingSelection } from '../src/services/species/species-landing.service';

const behaviorEntry = getSeoEvidenceEntry('sp_0432', 'reviewedTraits.shoaling');
assert.ok(behaviorEntry, 'the reviewed shoaling binding must exist');
assert.equal(getSeoEvidenceBindingStatus(behaviorEntry), 'confirmed');
assert.equal(getCurrentSeoEvidenceBinding(behaviorEntry).sourceIds[0], 'fishbase-paracheirodon-axelrodi');

const staleEntry = {
  ...behaviorEntry,
  currentSnapshot: () => ({ ...getReviewedEvidenceSnapshot('sp_0432') as object, minimumGroupSize: 6 }),
};
assert.equal(getSeoEvidenceBindingStatus(staleEntry), 'stale', 'a reviewed source field change must stale its SEO binding');

const blockedEntry = { ...behaviorEntry, sourceReady: () => false };
assert.equal(getSeoEvidenceBindingStatus(blockedEntry), 'blocked', 'a source that is no longer review-ready must block its SEO binding');

const cssOnlyEntry = { ...behaviorEntry, currentSnapshot: () => getReviewedEvidenceSnapshot('sp_0432')! };
assert.equal(getSeoEvidenceBindingStatus(cssOnlyEntry), 'confirmed', 'presentation-only changes do not alter the evidence fingerprint');
assert.equal(fingerprintSeoEvidence(getReviewedEvidenceSnapshot('sp_0432')!), behaviorEntry.binding.sourceFingerprint);

const fireProfile = getPublishedSpeciesProfile(getSpeciesLandingSelection('sp_0001')!, 'zh-CN');
const cardinalProfile = getPublishedSpeciesProfile(getSpeciesLandingSelection('sp_0432')!, 'zh-CN');
const yellowProfile = getPublishedSpeciesProfile(getSpeciesLandingSelection('sp_0001', 'sp_0030')!, 'zh-CN');
assert.equal(fireProfile.reviewedTraits.length, 0, 'unreviewed shrimp behavior must not enter the public profile');
assert.equal(cardinalProfile.reviewedTraits.length, 1, 'reviewed cardinal shoaling evidence should enter the public profile');
assert.match(yellowProfile.variants.find(variant => variant.id === 'sp_0030')?.difference || '', /黄色选育型/, 'confirmed variant differences should enter the public profile');
assert.equal(fireProfile.assets.filter(asset => asset.usage === 'hero').length, 1, 'approved fire shrimp Hero must enter the public profile');
assert.ok(yellowProfile.variants.find(variant => variant.id === 'sp_0030')?.image, 'approved yellow shrimp card must enter the public profile');
assert.equal(getSeoEvidenceBindingStatus(getSeoEvidenceEntry('sp_0432', 'assets.hero')!), 'blocked', 'pending cardinal Hero asset must remain blocked');
assert.equal(getSeoEvidenceBindingStatus(getSeoEvidenceEntry('sp_0432', 'assets.variant-card')!), 'blocked', 'pending cardinal card asset must remain blocked');
assert.equal(cardinalProfile.assets.length, 0, 'pending cardinal assets must not enter the public profile');

const report = getSeoEvidenceReport();
assert.equal(report.length, 10, 'the pilot evidence report must cover catalog, behavior and all pilot asset bindings');
assert.ok(report.every(item => item.currentFingerprint === item.sourceFingerprint || item.status !== 'confirmed'), 'confirmed bindings must match their current source fingerprint');

for (const asset of getSeoAssetFileManifest()) {
  const bytes = await readFile(resolve(process.cwd(), 'public', asset.path.replace(/^\//, '')));
  const actual = createHash('sha256').update(bytes).digest('hex');
  assert.equal(actual, asset.sha256, `${asset.bindingId} file hash changed; visual approval must be repeated`);
}

console.log('SEO evidence bindings passed: reviewed-source inheritance, stale/block gates, asset hashes, and published-profile fail-closed behavior are verified.');
console.log(JSON.stringify({ evidenceBindings: getSeoEvidenceReport() }, null, 2));
