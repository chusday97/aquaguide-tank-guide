import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const adaptive = read('src/components/common/AdaptiveDetailContent.tsx');
const species = read('src/components/SpeciesDetailDialog.tsx');
const livestock = read('src/components/aquarium/LivestockBatchCard.tsx');
const compatibility = read('src/components/CompatibilityRiskCalculator.tsx');
const navigation = read('src/components/layout/WorkspaceNavigationProvider.tsx');
const encyclopedia = read('src/pages/Encyclopedia.tsx');
const skill = read('.agents/skills/aquaguide-ui-ux/SKILL.md');

assert(adaptive.includes("desktopSize?: 'reading' | 'wide'"), 'Adaptive detail must expose semantic wide mode');
assert(adaptive.includes("desktopSize === 'wide' ? '860px'"), 'Wide desktop detail must use an information-dense width');
assert(adaptive.includes('!w-screen !max-w-none'), 'Wide phone detail must be full-screen rather than a squeezed drawer');
assert(species.includes('desktopSize="wide" data-detail-kind="species"'), 'Species detail must opt into wide/full-screen entity detail');

assert(livestock.includes('data-livestock-review-default-valid'), 'Livestock default state must be accepted by review CTA');
assert(livestock.includes("data-livestock-finish-mode={hasDraftChanges ? 'save' : 'done'}"), 'Unchanged valid defaults need a Done path');
assert(!livestock.includes('onClick={prepareReview} disabled={!hasPendingSelection}'), 'Review must not require users to manufacture a state change');

assert(compatibility.includes('data-compatibility-verdict={resultStatus}'), 'Compatibility result must expose a dominant semantic verdict');
assert(compatibility.includes('data-verdict-symbol={verdictCue?.symbol}'), 'Compatibility verdict must provide a scan-first symbol');
assert(compatibility.includes('信息不足 ≠ 安全'), 'Unknown must not visually/semantically collapse into safe');
assert(compatibility.includes('data-ai-advice-inline'), 'AI explanation must be inline/progressive disclosure');
assert(!compatibility.includes('<Dialog open={aiOpen}'), 'Non-blocking compatibility explanation must not open another Dialog');

assert(navigation.includes('workspaceReturnContext'), 'Specific cross-route tasks must preserve a return context');
assert(navigation.includes('data-workspace-return'), 'Destination must expose an explicit return affordance');
assert(navigation.includes("isSpecificAquariumTask"), 'Aquarium task routes must be distinguished from the generic Aquarium home');

assert(encyclopedia.includes("params.set('source', 'atlas-detail')"), 'Atlas entity detail must be route-addressable');
assert(encyclopedia.includes("navigateToRoute(taskRoutes.aquarium.livestock, { returnContext })"), 'View tank must carry exact caller context');
assert(encyclopedia.includes("params.get('source') === 'atlas-detail'"), 'Closing atlas detail must preserve the prior route instead of hard-resetting to Encyclopedia home');

assert(skill.includes('Preserve task context.'), 'UI skill must govern navigation continuity');
assert(skill.includes('Result first, explanation second.'), 'UI skill must govern scan-first result hierarchy');
assert(skill.includes('Form state and CTA state must agree.'), 'UI skill must govern default/CTA consistency');

console.log('PASS: UI interaction repair V1 contract');
