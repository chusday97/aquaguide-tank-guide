import assert from 'node:assert/strict';
import { getReviewedSpeciesKnowledge } from '../src/modules/knowledge/speciesKnowledge';
import { getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';

const knowledge = getReviewedSpeciesKnowledge('sp_0475');
assert.ok(knowledge);
assert.deepEqual(knowledge.environment?.waterTypes, ['freshwater', 'brackish']);
assert.equal(knowledge.environment?.waterType, 'unknown');
assert.equal(knowledge.socialBehavior?.mode, 'school');
assert.equal(knowledge.socialBehavior?.minimumGroupSize, 3);
assert.equal(knowledge.socialBehavior?.territoriality, 'unknown');
assert.equal(knowledge.socialBehavior?.predationRisk, 'unknown');
assert.ok(knowledge.socialBehavior?.evidence.sourceIds.includes('jstage-rhodeus-ocellatus-schooling'));

const profile = getReviewedCompatibilityProfile('sp_0475');
assert.ok(profile, 'Rhodeus must have direct reviewed Compatibility Profile');
assert.deepEqual(profile.waterTypes, ['freshwater', 'brackish']);
assert.equal(profile.minimumGroupSize, 3);
assert.deepEqual(profile.behaviorTraits, ['schooling']);
assert.deepEqual(profile.predationTargets, []);
assert.ok(profile.citations.some(source => source.id === 'jstage-rhodeus-ocellatus-schooling'));

console.log('Rhodeus compatibility authority passed: dual-water + schooling minimum 3, without invented peaceful/territorial claims');
