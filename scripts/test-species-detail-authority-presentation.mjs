import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/SpeciesDetailDialogBase.tsx', 'utf8');

assert.equal(
  source.includes('watchFor={displayFit.risks.filter'),
  false,
  'Species Detail watch list must not come from page-level heuristic FitDimensions',
);
assert.equal(
  source.includes('avoid={displayFit.risks.filter'),
  false,
  'Species Detail avoid list must not come from page-level heuristic FitDimensions',
);
assert.equal(
  source.includes('const priorityItems = [...displayFit.risks'),
  false,
  'Species Detail evidence must not be assembled from heuristic FitDimensions',
);
assert.ok(
  source.includes('compatibilityResult.warningRules'),
  'Species Detail must expose canonical Compatibility warning rules',
);
assert.ok(
  source.includes('compatibilityResult.blockingRules'),
  'Species Detail must expose canonical Compatibility blocking rules',
);
assert.ok(
  source.includes('compatibilityResult.missingData'),
  'Species Detail must preserve canonical Compatibility missing-data evidence',
);
assert.ok(
  source.includes('data-species-fit-reference'),
  'Species detail contextual metrics must be explicitly presentation-only references',
);

console.log('Species Detail authority presentation contract PASS');
