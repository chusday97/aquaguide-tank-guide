import assert from 'node:assert/strict';
import {
  fingerprintSpeciesEditorialEvidence,
  getCurrentSpeciesEditorialEvidence,
  getConfirmedSpeciesEditorialEvidence,
  getPublishedSpeciesEditorial,
  getSpeciesEditorialEvidenceReport,
  getSpeciesEditorialEvidenceStatus,
  speciesEditorialEvidence,
} from '../src/data/speciesEditorialEvidence';
import { getPublishedSpeciesProfile } from '../src/data/publishedSpeciesProfile';
import { getSpeciesLandingSelection } from '../src/services/species/species-landing.service';

assert.equal(speciesEditorialEvidence.length, 13, 'the pilot must contain thirteen confirmed claims');
assert.equal(speciesEditorialEvidence.filter(entry => entry.status === 'confirmed').length, 13, 'the approved pilot claims must be explicitly confirmed');
assert.ok(getSpeciesEditorialEvidenceReport().every(entry => entry.status === 'confirmed'), 'confirmed evidence must remain valid at runtime');
assert.equal(getConfirmedSpeciesEditorialEvidence('sp_0001').length, 9, 'the nine confirmed fire shrimp claims must enter the confirmed set');

const sample = speciesEditorialEvidence[0];
const confirmed = { ...sample, status: 'confirmed' as const, confirmedBy: 'project-owner' as const, confirmedAt: '2026-09-01' };
assert.equal(getSpeciesEditorialEvidenceStatus(confirmed), 'confirmed');
assert.equal(getCurrentSpeciesEditorialEvidence({ ...confirmed, renderedClaim: `${confirmed.renderedClaim} 改写` }).status, 'stale');
assert.equal(getSpeciesEditorialEvidenceStatus({ ...confirmed, sourceIds: ['missing-source'] }), 'blocked');
assert.equal(fingerprintSpeciesEditorialEvidence(sample), sample.sourceFingerprint);

const fireProfile = getPublishedSpeciesProfile(getSpeciesLandingSelection('sp_0001')!, 'zh-CN');
const cardinalProfile = getPublishedSpeciesProfile(getSpeciesLandingSelection('sp_0432')!, 'zh-CN');
const yellowProfile = getPublishedSpeciesProfile(getSpeciesLandingSelection('sp_0001', 'sp_0030')!, 'zh-CN');
assert.equal(fireProfile.editorial?.signature, '极火虾是 Neocaridina davidi 的红色选育型；其基础物种是原生于台湾淡水溪流的小型淡水观赏虾。');
assert.equal(fireProfile.editorial?.maintenance, undefined, 'unsupported maintenance must remain absent from PublishedSpeciesProfile');
assert.equal(fireProfile.faq.length, 3, 'the three confirmed FAQs must enter the public profile');
assert.match(yellowProfile.variants.find(variant => variant.id === 'sp_0030')?.difference || '', /黄色选育型/);
assert.match(fireProfile.lifeProfile?.activity?.answer || '', /水底/);
assert.match(fireProfile.lifeProfile?.foraging?.answer || '', /生物膜/);
assert.match(cardinalProfile.lifeProfile?.social?.answer || '', /群游倾向/);
assert.match(cardinalProfile.lifeProfile?.activity?.answer || '', /中层/);
assert.match(cardinalProfile.lifeProfile?.foraging?.answer || '', /蠕虫/);
assert.deepEqual(yellowProfile.lifeProfile, fireProfile.lifeProfile, 'a variant must inherit the base life profile without creating new evidence');
assert.match(getPublishedSpeciesEditorial('sp_0432')?.habitat?.summary || '', /奥里诺科/);
assert.equal(speciesEditorialEvidence.filter(entry => entry.status === 'candidate').length, 0, 'all four owner-confirmed behavior claims must leave candidate state');
assert.match(yellowProfile.lifeProfile?.activity?.answer || '', /水底/);
assert.match(yellowProfile.lifeProfile?.foraging?.answer || '', /生物膜/);

console.log('SEO editorial evidence passed: confirmed claims, fingerprint stale/block gates, and fail-closed publication are verified.');
console.log(JSON.stringify({ evidence: getSpeciesEditorialEvidenceReport() }, null, 2));
