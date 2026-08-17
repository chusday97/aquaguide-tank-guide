import assert from 'node:assert/strict';
import { fishData } from '../src/data/fishData';
import { evaluateCompatibilityDecision } from '../src/modules/knowledge/compatibilityKnowledge';
import { getCompatibilityEvidenceAudit, getReviewedCompatibilityProfile } from '../src/data/compatibilityEvidence';
import { getLifeType } from '../src/modules/species/species.service';
import type { Aquarium } from '../src/types';

const tank: Aquarium = {
  id: 'compatibility-evidence-gate',
  name: 'Compatibility evidence gate',
  fishes: [],
  dimensions: { length: '60', width: '40', height: '40' },
  waterType: 'Freshwater',
  targetTemperature: '24',
  substrate: '水草泥',
  plants: [],
  hardscape: [],
  equipment: { filter: '瀑布过滤', heater: true, oxygen: false, light: '普通灯' },
};

const commonNames = ['红绿灯', '宝莲灯', '黑壳虾', '极火虾', '斑马螺', '咖啡鼠', '白云金丝', '孔雀鱼', '水晶虾'];
const commonSpecies = fishData.filter(fish => commonNames.includes(fish.name) && !['plant', 'hardscape'].includes(getLifeType(fish)));

type RuleAudit = { code: string; severity: string; evidence: string };
type Row = {
  existingId: string;
  existingName: string;
  candidateId: string;
  candidateName: string;
  status: string;
  blockingRules: RuleAudit[];
  warningRules: RuleAudit[];
  missingRules: RuleAudit[];
  passedRules: RuleAudit[];
};

const toAudit = (items: Array<{ code: string; severity: string; evidence: string }>): RuleAudit[] => (
  items.map(item => ({ code: item.code, severity: item.severity, evidence: item.evidence }))
);

const rows: Row[] = [];
for (const existing of commonSpecies) {
  for (const candidate of commonSpecies) {
    if (existing.id === candidate.id) continue;
    const decision = evaluateCompatibilityDecision({
      tank,
      items: [
        { species: existing, quantity: existing.id === 'sp_0431' ? 6 : 2, origin: 'existing' },
        { species: candidate, quantity: candidate.id === 'sp_0432' ? 6 : 1, origin: 'candidate' },
      ],
    });
    const pair = decision.pairResults[0];
    if (!pair) continue;
    rows.push({
      existingId: existing.id,
      existingName: existing.name,
      candidateId: candidate.id,
      candidateName: candidate.name,
      status: pair.status,
      blockingRules: toAudit(pair.rawResult.blockingRules),
      warningRules: toAudit(pair.rawResult.warningRules),
      missingRules: toAudit(pair.rawResult.missingData),
      passedRules: toAudit(pair.rawResult.passedRules),
    });
  }
}

assert.ok(rows.length > 0, 'compatibility evidence gate must evaluate real catalog pairs');
const evidenceAudit = getCompatibilityEvidenceAudit();
assert.ok(evidenceAudit.reviewedPairRules.length >= 4, 'Batch 3 must preserve at least four reviewed pair rules after adding direct Channa–Rhodeus evidence');
const auditedOscarZebrafishRule = evidenceAudit.reviewedPairRules.find(rule => (
  rule.speciesIds.includes('sp_0451') && rule.speciesIds.includes('sp_0435')
));
assert.ok(auditedOscarZebrafishRule, 'reviewed evidence audit must retain the Oscar–zebrafish pair rule');
assert.equal(auditedOscarZebrafishRule.basis, 'pair_rule', 'Oscar–zebrafish audit evidence must remain direct pair_rule provenance');
assert.equal(auditedOscarZebrafishRule.verdict, 'not_recommended');
assert.equal(auditedOscarZebrafishRule.reviewStatus, 'reviewed');

const auditedChannaRhodeusRule = evidenceAudit.reviewedPairRules.find(rule => (
  rule.speciesIds.includes('sp_0224') && rule.speciesIds.includes('sp_0475')
));
assert.ok(auditedChannaRhodeusRule, 'reviewed evidence audit must retain the Channa argus–Rhodeus ocellatus pair rule');
assert.equal(auditedChannaRhodeusRule.basis, 'pair_rule', 'Channa–Rhodeus audit evidence must remain direct pair_rule provenance');
assert.equal(auditedChannaRhodeusRule.verdict, 'not_recommended');
assert.equal(auditedChannaRhodeusRule.reviewStatus, 'reviewed');

const tetraPair = rows.find(row => row.existingId === 'sp_0431' && row.candidateId === 'sp_0432');
assert.ok(tetraPair, 'reviewed 红绿灯 → 宝莲灯 pair must exist in the catalog matrix');
assert.equal(tetraPair.status, 'caution', 'explicitly reviewed 红绿灯 → 宝莲灯 pair must stay caution, not absolute compatible or blocked');
assert.equal(tetraPair.blockingRules.some(item => item.code === 'predation_risk'), false, 'peaceful small tetra pair must not regress into a predation block');

const guppyNeon = rows.find(row => row.existingId === 'sp_0436' && row.candidateId === 'sp_0431');
assert.ok(guppyNeon, 'reviewed guppy and neon profiles must be present in the priority matrix');
assert.equal(guppyNeon.status, 'insufficient_data', 'reviewed species profiles without a reviewed pair rule must not become recordable by absence-of-risk inference');
assert.ok(guppyNeon.missingRules.some(item => item.code === 'pair_evidence_unreviewed' && item.severity === 'medium'), 'guppy → neon must expose the missing pair-evidence boundary');

const whiteCloudGuppy = rows.find(row => row.existingId === 'sp_0434' && row.candidateId === 'sp_0436');
assert.ok(whiteCloudGuppy, 'reviewed white-cloud and guppy profiles must be present in the priority matrix');
assert.ok(
  whiteCloudGuppy.status === 'insufficient_data' || whiteCloudGuppy.status === 'not_recommended',
  'two reviewed species profiles without a reviewed pair rule must never become recordable; a higher-priority hard block may correctly return not_recommended.',
);
if (whiteCloudGuppy.status === 'insufficient_data') {
  assert.ok(whiteCloudGuppy.missingRules.some(item => item.code === 'pair_evidence_unreviewed' && item.severity === 'medium'), 'white cloud → guppy must expose pair-evidence missing when no hard block outranks it');
} else {
  assert.ok(whiteCloudGuppy.blockingRules.length > 0, 'white cloud → guppy may bypass pair-evidence missing only when an explicit hard block is present');
}

const oscar = fishData.find(fish => fish.id === 'sp_0451');
const zebrafish = fishData.find(fish => fish.id === 'sp_0435');
assert.ok(oscar && zebrafish, 'Oscar and zebrafish direct-evidence pair must exist in the catalog');
const oscarZebrafishDecision = evaluateCompatibilityDecision({
  tank,
  items: [
    { species: oscar, quantity: 1, origin: 'existing' },
    { species: zebrafish, quantity: 6, origin: 'candidate' },
  ],
});
const oscarZebrafishPair = oscarZebrafishDecision.pairResults[0];
assert.ok(oscarZebrafishPair, 'Oscar → zebrafish must produce a pair result');
assert.equal(oscarZebrafishPair.status, 'not_recommended', 'direct predator–prey evidence must block Oscar + zebrafish cohabitation');
const directPairRule = oscarZebrafishPair.rawResult.blockingRules.find(item => item.code === 'pair_rule_predation_threat');
assert.ok(directPairRule, 'Oscar + zebrafish must expose its reviewed pair-level predation evidence');
assert.equal(directPairRule.basis, 'pair_rule', 'direct predator–prey evidence must retain pair_rule provenance');
assert.equal(directPairRule.reviewStatus, 'reviewed');
assert.ok(directPairRule.citations.length >= 2, 'direct pair rule must retain its peer-reviewed citations');
assert.equal(directPairRule.evidence.includes('并非直接配对实验'), false, 'direct pair evidence must not be mislabeled as indirect evidence');
assert.ok(directPairRule.evidence.includes('实验条件不等于家庭水族箱长期同缸'), 'direct pair evidence must preserve the laboratory-to-husbandry limitation');

const channa = fishData.find(fish => fish.id === 'sp_0224');
const rhodeus = fishData.find(fish => fish.id === 'sp_0475');
assert.ok(channa && rhodeus, 'Channa argus and Rhodeus ocellatus direct-evidence pair must exist in the catalog');
const channaRhodeusDecision = evaluateCompatibilityDecision({
  tank,
  items: [
    { species: channa, quantity: 1, origin: 'existing' },
    { species: rhodeus, quantity: 6, origin: 'candidate' },
  ],
});
const channaRhodeusPair = channaRhodeusDecision.pairResults[0];
assert.ok(channaRhodeusPair, 'Channa argus → Rhodeus ocellatus must produce a pair result');
assert.equal(channaRhodeusPair.status, 'not_recommended', 'direct predator–prey evidence must block Channa argus + Rhodeus ocellatus cohabitation');
const channaDirectPairRule = channaRhodeusPair.rawResult.blockingRules.find(item => item.code === 'pair_rule_predation_threat');
assert.ok(channaDirectPairRule, 'Channa argus + Rhodeus ocellatus must expose reviewed pair-level predation evidence');
assert.equal(channaDirectPairRule.basis, 'pair_rule');
assert.equal(channaDirectPairRule.reviewStatus, 'reviewed');
assert.ok(channaDirectPairRule.citations.length >= 2, 'Channa–Rhodeus pair rule must retain both peer-reviewed citations');
assert.equal(channaDirectPairRule.evidence.includes('并非直接配对实验'), false, 'direct Channa–Rhodeus evidence must not be mislabeled as indirect evidence');
assert.ok(channaDirectPairRule.evidence.includes('实验条件不等于家庭水族箱长期同缸'), 'Channa–Rhodeus direct evidence must preserve the laboratory-to-husbandry limitation');

const recordable = rows.filter(row => row.status === 'compatible' || row.status === 'caution');
assert.equal(recordable.length, 2, 'Batch 2 adds a reviewed blocked pair outside the priority cohort; recordable priority directions must remain the explicit tetra pair in both directions.');

for (const row of recordable) {
  assert.ok(
    getReviewedCompatibilityProfile(row.existingId),
    `recordable pair ${row.existingName} → ${row.candidateName} is missing reviewed existing-species evidence`,
  );
  assert.ok(
    getReviewedCompatibilityProfile(row.candidateId),
    `recordable pair ${row.existingName} → ${row.candidateName} is missing reviewed candidate-species evidence`,
  );
  const blockingMissing = row.missingRules.filter(item => item.severity === 'high' || item.severity === 'medium');
  assert.equal(
    blockingMissing.length,
    0,
    `recordable pair ${row.existingName} → ${row.candidateName} must not retain high/medium unresolved missing-data rules: ${JSON.stringify(blockingMissing)}`,
  );
}

const counts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});
const recordableDirections = recordable.map(row => ({
  direction: `${row.existingId}/${row.existingName} -> ${row.candidateId}/${row.candidateName}`,
  status: row.status,
  warningRules: row.warningRules,
  missingRules: row.missingRules,
  passedRules: row.passedRules,
}));
console.log(`Compatibility evidence coverage passed: ${rows.length} real common-species directions; recordable=${recordable.length}; statuses=${JSON.stringify(counts)}.`);
console.log(`Reviewed pair evidence floor passed: ${evidenceAudit.reviewedPairRules.length} reviewed pair rules.`);
console.log(`Direct reviewed blocked pair passed: ${oscar.name}/${oscar.id} + ${zebrafish.name}/${zebrafish.id} = ${oscarZebrafishPair.status}.`);
console.log(`Recordable priority direction audit: ${JSON.stringify(recordableDirections)}`);
