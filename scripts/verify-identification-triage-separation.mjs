import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve('src/pages/Identify.tsx'), 'utf8');
const flowSource = readFileSync(resolve('src/services/ai/identification-triage-flow.ts'), 'utf8');

assert.match(source, /setStage\('identified'\)/, '确认候选后必须先进入识别完成页');
assert.match(source, /onClick=\{startHealthTriage\}/, '健康分诊必须由用户主动触发');
assert.match(source, /isSpeciesEligibleForHealthTriage\(selectedFish\)/, '非鱼类必须被挡在鱼类健康分诊之外');
assert.match(source, /onViewSelected=\{suggestion =>[\s\S]*confirmFish\(fish\)/, '手动搜索必须复用同一确认流程');
assert.match(source, /onClick=\{\(\) => void confirmFish\(candidate\.fish!\)\}/, '视觉候选必须复用同一确认流程');
assert.match(flowSource, /stage === 'describe' \|\| stage === 'question'/, '只有症状描述和追问草稿需要离开保护');
const draftGuardSource = flowSource.split('export const shouldProtectDiagnosisDraft')[1] || '';
assert.doesNotMatch(draftGuardSource, /identified/, '识别完成页不得触发症状草稿保护');

await import('./verify-identify-flow-separation.mjs');

console.log('identification triage separation: shared confirmation and draft boundary passed');
