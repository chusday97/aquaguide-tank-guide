import fs from 'node:fs';

const surface = fs.readFileSync('src/components/result/DecisionResultSurface.tsx', 'utf8');
const adapters = fs.readFileSync('src/modules/result/resultAdapters.ts', 'utf8');
const care = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');
const compatibility = fs.readFileSync('src/components/CompatibilityRiskCalculator.tsx', 'utf8');
const speciesDetail = fs.readFileSync('src/components/SpeciesDetailDialogBase.tsx', 'utf8');
const identify = fs.readFileSync('src/pages/Identify.tsx', 'utf8');
const aquarium = fs.readFileSync('src/pages/Aquarium.tsx', 'utf8');

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
assert(care.includes("getCareActionEvidenceForText(topic, 'immediate', visibleActions[0]"), 'Knowledge primary evidence must stay action-scoped and use the Care evidence API kind');
assert(care.includes("getCareActionEvidenceForText(topic, 'immediate', item.description || item.title, index + 1)"), 'Knowledge follow-up evidence must retain the original immediate-action index');
assert(care.includes("visibleActions.slice(1, 3)"), 'Knowledge shared surface must feed at most two follow-up actions');

assert(care.includes('testId="care-procedure-decision"'), 'Procedure must consume the shared decision-first surface');
assert(care.includes('data-care-procedure-result'), 'Procedure needs a stable first-screen result selector');
assert(care.includes("eyebrow={isEn ? 'DO THIS FIRST' : '现在先做'}"), 'Procedure must explicitly frame the first operational step as the action to take now');
assert(care.includes('title={procedureSteps[0].title}') && care.includes('summary={procedureSteps[0].description}'), 'Procedure hero must come from the first concrete step');
assert(care.includes('primarySource={careEvidenceSource(immediateEvidence[0])}'), 'Procedure primary source must remain tied to the first immediate action');
assert(care.includes('procedureSteps.slice(1, 3)'), 'Procedure shared surface must feed at most two next steps');
assert(care.includes('source: careEvidenceSource(immediateEvidence[index + 1])'), 'Procedure follow-up sources must retain original action indexes');
assert(care.includes('watchFor={[getProcedureObservation(topic)]}'), 'Procedure must expose what to observe after the operation');
assert(care.includes('avoid={procedureReminders.slice(0, 2).map(item => item.title)}'), 'Procedure must preserve bounded avoid guidance');
assert(!care.includes('Follow Steps Sequentially') && !care.includes('现在按顺序做'), 'Legacy duplicate Procedure first-screen step card must stay removed');
assert(care.includes("isEn ? 'Record Water Change in Tank' : '去记录本次换水'"), 'Procedure completion/record CTA must remain after the operational steps');
assert(care.includes('data-disclosure-purpose="secondary_evidence"'), 'Procedure detailed explanation must remain behind disclosure');

assert(compatibility.includes('testId="compatibility-decision"'), 'Compatibility must consume the shared decision-first surface');
assert(compatibility.includes('compatibilityRuleSources(ruleItems)'), 'Compatibility consumer must map deterministic rules to action-level source status');
assert(compatibility.includes("resultStatus === 'not_recommended'"), 'Compatibility must preserve the deterministic blocked status branch');
assert(compatibility.includes("resultStatus === 'insufficient_data'"), 'Compatibility must preserve the complete-information status branch');
assert(compatibility.includes("if (resultStatus === 'not_recommended' || resultStatus === 'insufficient_data') return;"), 'Compatibility recording must remain fail-closed for blocked or incomplete decisions');
assert(!compatibility.includes('data-compatibility-verdict={resultStatus}'), 'Legacy report-style Compatibility verdict must stay removed');
assert(compatibility.includes('data-compatibility-pair-details'), 'Pair-level detail must remain available behind progressive disclosure');

assert(speciesDetail.includes("import { DecisionResultSurface } from './result/DecisionResultSurface';"), 'Species Detail must import the shared decision surface');
assert(speciesDetail.includes('testId="species-detail-decision"'), 'Species Detail must consume the shared decision-first surface');
assert(speciesDetail.includes('data-species-detail-decision-result'), 'Species Detail needs a stable fit-decision wrapper selector');
assert(speciesDetail.includes('title={displayFit.title}'), 'Species Detail decision hero must come from the tank-fit conclusion, not the species title');
assert(speciesDetail.includes("summary={aquariumContext ? displayFit.conclusion : t('encyclopedia.conclusionNoTank')}"), 'Species Detail must preserve the contextual fit summary');
assert(speciesDetail.includes('evidence={verdictReasons.map(reason => `${reason.label} · ${reason.text}`)}'), 'Species Detail key reasons must move behind shared progressive disclosure');
assert(!speciesDetail.includes("aria-label={isEn ? 'Key reasons' : '关键原因'}"), 'Legacy always-visible Species Detail reasons must stay removed');
assert((speciesDetail.match(/data-species-detail-primary-action/g) || []).length === 1, 'Species Detail must expose exactly one stable primary CTA selector');
assert(speciesDetail.includes('data-species-detail-edit-tank-record'), 'Aquarium-owned Species Detail must preserve the tank-record edit action');
assert(speciesDetail.includes('data-disclosure-purpose="secondary_evidence"'), 'Species Detail fit/compatibility evidence must remain collapsed behind disclosure');

assert(identify.includes("import { DecisionResultSurface } from '../components/result/DecisionResultSurface';"), 'Identification must import the shared decision surface');
assert(identify.includes('testId="identify-decision"'), 'Identification candidate review must consume the shared decision-first surface');
assert(identify.includes("eyebrow={isEn ? 'NEEDS CONFIRMATION' : '需要你确认'}"), 'Identification must explicitly frame AI output as requiring user confirmation');
assert(identify.includes("recognition?.status === 'ambiguous'"), 'Identification must preserve ambiguous recognition as an explicit UI state');
assert(identify.includes("AI candidates are not confirmed species until you choose one."), 'Identification summary must state that AI candidates are not confirmed species');
assert(identify.includes('data-identify-candidate-options'), 'Identification must preserve a stable multi-candidate choice set');
assert(identify.includes('data-identify-candidate-confirm'), 'Identification candidate confirmation must remain an explicit user action');
assert(identify.includes('onClick={() => void confirmFish(candidate.fish!)}'), 'Visual candidate confirmation must continue through confirmFish');
assert(identify.includes("setStage('identified')"), 'Only the explicit confirmation path may move the flow into identified state');
assert(identify.includes('data-identify-confirmed={selectedFish.id}'), 'Confirmed Identification state must expose a stable species-bound selector only after explicit confirmation');
assert(identify.includes('onClick={startHealthTriage}'), 'Health triage must remain a separate explicit user action after identification');
assert(identify.includes("stage === 'candidates'") && identify.includes("stage === 'identified'"), 'Candidate review and confirmed identification must remain separate stages');
assert(!identify.includes('primaryControl={<button'), 'Identification shared surface must not auto-promote one candidate as the primary confirmed choice');

assert(aquarium.includes("import { DecisionResultSurface } from '../components/result/DecisionResultSurface';"), 'Live Tank Copilot must import the shared decision surface');
assert(aquarium.includes("const openTankBuildCopilot = () => {\n    setIsTankCopilotOpen(true);\n  };"), 'Live Tank Copilot quick action must open the real Copilot dialog');
assert(aquarium.includes('testId="tank-copilot-decision"'), 'Live Tank Copilot must expose a shared decision-first result');
assert(aquarium.includes('data-tank-copilot-primary-action'), 'Tank Copilot decision must expose one stable primary-action selector');
assert(aquarium.includes('data-tank-copilot-ai-boundary'), 'Tank Copilot must expose an explicit AI-vs-local-rule authority boundary');
assert(aquarium.includes("label: isEn ? 'AI-generated supporting context' : 'AI 生成的辅助解释'"), 'Model-originated Copilot context must be visibly identified as AI-generated');
assert(aquarium.includes("status: 'candidate'"), 'Model-originated Copilot context must remain candidate evidence, never Verified');
assert(aquarium.includes('tankCopilotResult.goalUnderstanding') && aquarium.includes("tankCopilotResult.planSummary || ''"), 'Model interpretation and plan summary must move behind shared progressive disclosure');
assert(!aquarium.includes("isEn ? 'Recommended Direction' : '推荐方向'"), 'Legacy always-visible model plan-summary card must stay removed');
assert(aquarium.includes("tankCopilotResult && !tankCopilotNeedsAnswers ? 'hidden' : ''"), 'Legacy footer primary must not duplicate the decision-surface primary action');

console.log('Result UX V1 contract: PASS');
