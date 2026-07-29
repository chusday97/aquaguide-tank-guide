import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const files = [
  'src/components/onboarding/OnboardingTaskCard.tsx',
  'src/components/product/StatusSummaryCard.tsx',
  'src/components/SpeciesDetailDialog.tsx',
  'src/components/visual-results/VisualResultCard.tsx',
  'src/pages/Aquarium.tsx',
  'src/pages/CareEncyclopedia.tsx',
  'src/pages/Encyclopedia.tsx',
  'src/pages/Identify.tsx',
];
const allowedPurposes = new Set([
  'secondary_evidence',
  'advanced_data',
  'overflow_list',
  'alternative_plan',
]);
const forbiddenPrimaryContent = [
  /喂养速览/,
  /Feeding at a glance/i,
  /暂时不要这样做/,
  /Avoid For Now/i,
  /紧急处理/,
  /Emergency Actions/i,
];

const stripDisabledLegacyDialog = source => source.replace(
  /<Dialog open=\{false\}[\s\S]*?<\/Dialog>/g,
  '',
);

for (const relativePath of files) {
  const source = stripDisabledLegacyDialog(readFileSync(resolve(relativePath), 'utf8'));
  const detailsBlocks = source.match(/<details\b[\s\S]*?<\/details>/g) || [];
  const stateDisclosureControls = source.match(/<(?:button|div)\b[^>]*aria-expanded=\{[^}]+\}[^>]*>/g) || [];

  for (const block of detailsBlocks) {
    const purpose = block.match(/data-disclosure-purpose="([^"]+)"/)?.[1];
    assert.ok(purpose, `${relativePath}: every details disclosure needs data-disclosure-purpose`);
    assert.ok(allowedPurposes.has(purpose), `${relativePath}: unsupported disclosure purpose "${purpose}"`);
    forbiddenPrimaryContent.forEach(pattern => {
      assert.equal(pattern.test(block), false, `${relativePath}: primary or safety content must not be hidden (${pattern})`);
    });
  }

  for (const control of stateDisclosureControls) {
    if (control.includes('data-transient-control=')) continue;
    const purpose = control.match(/data-disclosure-purpose="([^"]+)"/)?.[1];
    assert.ok(purpose, `${relativePath}: every aria-expanded disclosure needs data-disclosure-purpose`);
    assert.ok(allowedPurposes.has(purpose), `${relativePath}: unsupported aria-expanded purpose "${purpose}"`);
  }
}

const speciesDetail = readFileSync(resolve('src/components/SpeciesDetailDialog.tsx'), 'utf8');
const feedingIndex = speciesDetail.indexOf('data-species-feeding-summary');
const environmentIndex = speciesDetail.indexOf('data-species-environment-summary');
const firstDisclosureIndex = speciesDetail.indexOf('data-disclosure-purpose');
assert.ok(feedingIndex >= 0, 'species detail must expose a feeding summary');
assert.ok(environmentIndex >= 0, 'species detail must expose an environment summary');
assert.ok(firstDisclosureIndex < 0 || feedingIndex < firstDisclosureIndex, 'feeding summary must appear before detail disclosures');
assert.ok(firstDisclosureIndex < 0 || environmentIndex < firstDisclosureIndex, 'environment summary must appear before detail disclosures');

const aquarium = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');
const statusSummary = readFileSync(resolve('src/components/product/StatusSummaryCard.tsx'), 'utf8');
assert.equal(aquarium.includes('aquarium-zone-toggle'), false, 'mobile manage and learn zones must stay directly visible');
assert.equal(aquarium.includes('isDailyActionWhyOpen'), false, 'daily action must not repeat its reason in a why disclosure');
assert.equal(aquarium.includes('>+{ownedArchivePreviewItems.length - 3}<'), false, 'livestock overflow must not use an ambiguous +N label');
assert.ok(statusSummary.includes('data-daily-action='), 'daily action must remain directly visible');
assert.ok(statusSummary.includes('data-care-plan-visible'), 'the nearest care plan must remain directly visible');
assert.ok(statusSummary.includes('carePlan.visibleItems.slice(0, 1)'), 'one care plan must not depend on opening the overflow disclosure');

console.log('disclosure contract verified: only evidence, advanced data, overflow lists, and alternative plans may collapse');
