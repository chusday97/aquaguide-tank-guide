import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const detail = await readFile(new URL('../src/components/SpeciesDetailDialog.tsx', import.meta.url), 'utf8');
const panel = await readFile(new URL('../src/components/compatibility/RiskAndAlternativesPanel.tsx', import.meta.url), 'utf8');

assert.match(detail, /recommendReplacementSpecies/);
assert.match(detail, /RiskAndAlternativesPanel/);
assert.match(
  detail,
  /if \(displayFit\.status === 'unsuitable' \|\| displayFit\.status === 'conflictRisk'\) \{\s*setIsAlternativesOpen\(true\);\s*return;\s*\}/,
  'unsuitable/conflictRisk primary CTA must open the real alternatives result instead of routing to calculator',
);

const riskBranch = detail.match(/if \(displayFit\.status === 'unsuitable' \|\| displayFit\.status === 'conflictRisk'\) \{[\s\S]*?\n    \}/)?.[0] || '';
assert.doesNotMatch(riskBranch, /onAddToCalculator|onGoCalculator/, 'risk/alternatives branch must not keep the old fake calculator jump');

const cautionBranch = detail.match(/if \(displayFit\.status === 'caution'\) \{[\s\S]*?\n    \}/)?.[0] || '';
assert.match(cautionBranch, /onAddToCalculator/);
assert.match(cautionBranch, /onGoCalculator/, 'explicit caution flow may keep the existing calculator route');

assert.match(panel, /data-risk-summary/);
assert.match(panel, /data-no-safe-alternative/);
assert.match(panel, /data-alternatives-insufficient/);
assert.match(panel, /更适合当前鱼缸/);
assert.match(panel, /有条件候选/);
assert.match(panel, /需要更多资料确认/);
assert.match(panel, /没有找到真正解决当前阻断风险的同类替代/);
assert.match(panel, /查看候选详情/);
assert.doesNotMatch(panel, /模拟加入这个鱼缸/);
assert.doesNotMatch(panel, /Simulate in this aquarium/);

console.log('risk and alternatives UI contract passed: CTA opens real replacement results, empty alternatives are explicit, and calculator quantity is not falsely promised');
