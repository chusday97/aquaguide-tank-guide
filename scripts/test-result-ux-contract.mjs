import fs from 'node:fs';

const surface = fs.readFileSync('src/components/result/DecisionResultSurface.tsx', 'utf8');
const adapters = fs.readFileSync('src/modules/result/resultAdapters.ts', 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(`Result UX contract failed: ${message}`);
};

assert(surface.includes("slice(0, 2)"), 'follow-up actions must be capped so the first result surface never becomes a task dump');
assert(surface.includes("slice(0, 3)"), 'watch/escalation lists must stay scannable');
assert(surface.includes("<details"), 'reasoning and sources must use progressive disclosure');
assert(surface.includes("Why this result?") && surface.includes("为什么是这个结果？"), 'reasoning disclosure must exist in both locales');
assert(surface.includes("Sources") && surface.includes("信息来源"), 'source disclosure must exist in both locales');
assert(surface.includes("Verified") && surface.includes("已核验"), 'reviewed evidence status must be visible');
assert(surface.includes("Needs action-level review") && surface.includes("待逐条核验"), 'candidate evidence must not be presented as reviewed');
assert(surface.includes('line-clamp-2'), 'hero explanation must be visually bounded');
assert(surface.includes('data-result-ux="decision"'), 'result surface needs a stable audit selector');
assert(surface.includes('data-result-ux-actions'), 'action stack needs a stable audit selector');
assert(surface.includes('data-result-ux-guardrails'), 'watch/escalation guardrails need a stable audit selector');
assert(surface.includes('data-result-ux-evidence'), 'evidence disclosure needs a stable audit selector');

assert(adapters.includes("rule.reviewStatus === 'reviewed' && reference.reviewStatus === 'reviewed'"), 'Compatibility sources may be Verified only when both rule and citation are reviewed');
assert(adapters.includes("evidence?.reviewStatus === 'reviewed'"), 'Care source status must come from action-level evidence review status');
assert(adapters.includes('diagnosisEscalationSignals'), 'diagnosis results must expose explicit escalation boundaries');
assert(adapters.includes('compatibilityEscalationSignals'), 'compatibility results must expose explicit escalation boundaries');

console.log('Result UX V1 contract: PASS');
