import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateTankState } from '../packages/domain-rules/src/tank-state';
import { buildCurrentTankRiskItems } from '../src/services/aquarium/tank-state-presentation.service';
import type { CurrentTankStateEvidence } from '../src/services/aquarium/tank-state-evidence.service';
import type { Aquarium, Fish } from '../src/types';

const fish: Fish = { id: 'mini', name: '迷你鹦鹉', scientificName: 'hybrid', category: '鱼类', image: '', difficulty: 'Easy', waterTemperature: '20-28°C', phLevel: '7-8', waterChangeCycle: 7, description: '', diet: '', tankSize: '至少 64 升', temperament: 'Aggressive', size: 'Medium' };
const aquarium: Aquarium = { id: 'tank', name: '40cm缸', fishes: [{ id: 'r1', fishId: fish.id, quantity: 2, entryDate: '2026-08-01' }], dimensions: { length: '40', width: '25', height: '30' }, waterType: 'Freshwater' };
const stableResult = evaluateTankState({ priors: [{ code: 'volume_guideline_gap', kind: 'space', level: 'medium', evidence: '通用空间建议' }], observations: [{ code: 'normal_activity', observedAt: '2026-08-23T00:00:00Z' }, { code: 'normal_feeding', observedAt: '2026-08-23T00:00:00Z' }], now: '2026-08-23T01:00:00Z' });
const evidence = { compatibilityDecision: null, priors: [], hardConstraints: [], observations: [], cohabitationDays: 22, result: stableResult } as CurrentTankStateEvidence;
assert.equal(stableResult.state, 'stable');
assert.equal(buildCurrentTankRiskItems({ aquarium, speciesCatalog: [fish], evidence }).length, 0, 'space prior + normal reality must not create a current risk card');

const aquariumSource = readFileSync(new URL('../src/pages/Aquarium.tsx', import.meta.url), 'utf8');
const diagnosisSource = readFileSync(new URL('../src/modules/diagnosis/diagnosis.rules.ts', import.meta.url), 'utf8');
assert.doesNotMatch(aquariumSource, /blockingCompatibilityRisk/, 'static danger must not own Today Action');
assert.doesNotMatch(aquariumSource, /Aggressive & Peaceful Species Mixed|攻击性和温和生物同缸/, 'Aquarium must not manufacture a current danger from temperament metadata');
assert.doesNotMatch(aquariumSource, /当前动物最低建议缸容/, 'generic tank-size guidance must not manufacture current removal/upgrade risk');
assert.doesNotMatch(diagnosisSource, /riskCount && input\.snapshot\.riskCount > 0 \? 'medium' : 'low'/, 'normal patrol must not be upgraded by inherited static riskCount');
console.log('P0 Existing Tank Authority contract: PASS');
