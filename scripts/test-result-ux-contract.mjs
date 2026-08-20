import fs from 'node:fs';

const surface = fs.readFileSync('src/components/result/DecisionResultSurface.tsx', 'utf8');
const adapters = fs.readFileSync('src/modules/result/resultAdapters.ts', 'utf8');
const care = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');
const compatibility = fs.readFileSync('src/components/CompatibilityRiskCalculator.tsx', 'utf8');

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

assert(care.includes('testId="care-diagnosis-decision"'), 'Diagnosis must consume the shared decision-first surface');
assert(care.includes('diagnosisEscalationSignals(result.riskLevel, isEn)'), 'Diagnosis consumer must expose escalation boundaries');
assert(!care.includes('isResultDetailOpen'), 'Diagnosis must not restore the legacy ad-hoc evidence disclosure');

assert(care.includes('testId="care-knowledge-decision"'), 'Knowledge must consume the shared decision-first surface');
assert(care.includes('data-care-result-primary'), 'Knowledge must expose one primary first-screen action');
assert(care.includes('data-disclosure-purpose="secondary_explanation"'), 'Knowledge long-form explanation must be an explicit disclosure');
assert(!care.includes("(meta.guideType === 'knowledge' || isDetailExpanded)"), 'Knowledge long-form explanation must not be expanded by default');
assert(care.includes('getCareActionEvidenceForText(topic, visibleActions[0]'), 'Knowledge primary evidence must stay action-scoped');
assert(care.includes("visibleActions.slice(1, 3)"), 'Knowledge shared surface must feed at most two follow-up actions');

assert(compatibility.includes('testId="compatibility-decision"'), 'Compatibility must consume the shared decision-first surface');
assert(compatibility.includes('compatibilityRuleSources(ruleItems)'), 'Compatibility consumer must map deterministic rules to action-level source status');
assert(compatibility.includes("resultStatus === 'not_recommended'"), 'Compatibility must preserve the deterministic blocked status branch');
assert(compatibility.includes("resultStatus === 'insufficient_data'"), 'Compatibility must preserve the complete-information status branch');
assert(compatibility.includes("if (resultStatus === 'not_recommended' || resultStatus === 'insufficient_data') return;"), 'Compatibility recording must remain fail-closed for blocked or incomplete decisions');
assert(!compatibility.includes('data-compatibility-verdict={resultStatus}'), 'Legacy report-style Compatibility verdict must stay removed');
assert(compatibility.includes('data-compatibility-pair-details'), 'Pair-level detail must remain available behind progressive disclosure');

console.log('Result UX V1 contract: PASS');
