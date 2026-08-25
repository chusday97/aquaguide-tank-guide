import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/SpeciesDetailDialog.tsx', 'utf8');

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
  'context metrics must be explicitly presentation-only references',
);
assert.ok(
  source.includes('data-species-prior-reference'),
  'static housing guidance must be visibly demoted to a reference block',
);
assert.ok(
  source.includes("'Not the verdict'") && source.includes("'不代表当前结论'"),
  'static species priors must explicitly state that they are not the verdict',
);
assert.equal(
  source.includes('metric.status !== \'ok\' && Boolean(settingsPanel'),
  false,
  'reference metrics must not use severity to decide whether they can route to settings',
);

console.log('Species Detail authority presentation contract PASS');
