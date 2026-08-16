import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/pages/CareEncyclopedia.tsx', import.meta.url), 'utf8');

for (const required of [
  "import { buildTankDecisionSupport } from '../lib/tankDecisionSupportOrchestrator';",
  "import { buildQuickDiagnosisConflictAugmentation } from '../lib/quickDiagnosisConflictAugmentation';",
  "import { InterventionComparisonPanel } from '../components/compatibility/InterventionComparisonPanel';",
  'data-care-conflict-augmentation',
  'data-open-intervention-comparison',
  'CARE_CONFLICT_DECISION_SURFACE_START',
  'CARE_CONFLICT_DECISION_SURFACE_END',
]) {
  assert.ok(source.includes(required), `missing Care decision-surface contract marker: ${required}`);
}

const start = source.indexOf('CARE_CONFLICT_DECISION_SURFACE_START');
const end = source.indexOf('CARE_CONFLICT_DECISION_SURFACE_END');
assert.ok(start >= 0 && end > start, 'Care decision-surface markers must form one ordered integration block');
const integration = source.slice(start, end);

assert.ok(integration.includes('buildTankDecisionSupport({'), 'Care surface must consume the shared Tank Decision Support orchestrator');
assert.ok(integration.includes('buildQuickDiagnosisConflictAugmentation({'), 'Care surface must consume the shared Quick Diagnosis augmentation model');
assert.ok(integration.includes('InterventionComparisonPanel'), 'Care surface must open the existing read-only intervention panel');
assert.ok(integration.includes('targetAquarium'), 'Care decision support must be scoped to the diagnosis aquarium');
assert.ok(integration.includes('fishData'), 'Care decision support must use the canonical catalog pool');
assert.ok(integration.includes('allAquariums: aquariums'), 'after canonical hydration verification, Care decision support must receive the reactive aquarium set for destination evaluation');

for (const forbidden of [
  'removeLivestock',
  'deleteLivestock',
  'onRemove',
  'onRelocate',
  'repository.remove',
  'repository.delete',
  'localStorage.setItem',
  'sessionStorage.setItem',
]) {
  assert.ok(!integration.includes(forbidden), `Care decision surface must remain read-only: ${forbidden}`);
}

const baseDiagnosisIndex = source.indexOf('buildStepDiagnosisResult({');
const augmentationRenderIndex = source.indexOf('data-care-conflict-augmentation');
assert.ok(baseDiagnosisIndex >= 0, 'existing base Quick Diagnosis result builder must remain present');
assert.ok(augmentationRenderIndex > baseDiagnosisIndex, 'conflict evidence must augment the base diagnosis rather than replace it');

assert.ok(
  source.includes("conflictAugmentation.status === 'specific_conflict_evidence'")
    && source.includes("conflictAugmentation.status === 'partial_specific_conflict_evidence'")
    && source.includes("conflictAugmentation.status === 'community_identity_incomplete'"),
  'Care surface must explicitly distinguish specific, partial and identity-incomplete augmentation states',
);

assert.ok(
  source.includes("diagnosisState.target.scope === 'whole_tank'")
    && source.includes('diagnosisState.target.speciesIds'),
  'selected diagnosis scope must flow into conflict evidence filtering',
);

assert.ok(
  source.includes(': null, [targetAquarium, aquariums]);'),
  'destination-aware decision support must recompute when repository-hydrated aquarium state changes',
);

console.log('Care conflict decision-surface static contract passed: additive, read-only, destination-reactive, shared decision/diagnosis models');
