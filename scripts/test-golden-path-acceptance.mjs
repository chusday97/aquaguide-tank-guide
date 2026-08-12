import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const spec = JSON.parse(readFileSync(resolve(root, 'evaluation/product/golden-path-v1.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

assert.equal(spec.version, 1, 'golden path spec must stay on version 1 until the contract changes intentionally');
assert.equal(spec.paths.length, 5, 'Golden Path v1 must contain exactly the five agreed core user journeys');

const expectedIds = ['GP-001', 'GP-002', 'GP-003', 'GP-004', 'GP-005'];
assert.deepEqual(spec.paths.map(path => path.id), expectedIds, 'Golden Path IDs/order must remain stable');

const allowedCoverage = new Set(['partial', 'mostly_covered', 'covered']);
for (const path of spec.paths) {
  assert.ok(path.name?.trim(), `${path.id} needs a user-facing journey name`);
  assert.ok(path.goal?.trim(), `${path.id} needs a clear user goal`);
  assert.ok(Array.isArray(path.milestones) && path.milestones.length >= 6, `${path.id} must define at least 6 observable milestones`);
  assert.equal(new Set(path.milestones).size, path.milestones.length, `${path.id} milestone IDs must be unique`);
  assert.ok(Array.isArray(path.forbidden) && path.forbidden.length >= 3, `${path.id} must define at least 3 forbidden outcomes`);
  assert.ok(Array.isArray(path.existingAutomation) && path.existingAutomation.length >= 3, `${path.id} must map to at least 3 existing regression gates before being treated as a Golden Path`);
  assert.ok(allowedCoverage.has(path.coverage), `${path.id} uses an unsupported coverage state: ${path.coverage}`);
  for (const command of path.existingAutomation) {
    assert.ok(pkg.scripts?.[command], `${path.id} references missing npm script ${command}`);
  }
}

const crossJourneyRequired = new Map([
  ['GP-001', ['test:guided-navigation-ui', 'test:onboarding-goal-paths', 'test:task-entry']],
  ['GP-002', ['test:guided-navigation-ui', 'test:core-flow-state-eval', 'test:livestock-recording']],
  ['GP-003', ['test:core-flow-state-ui', 'test:daily-check', 'test:daily-discovery']],
  ['GP-004', ['test:daily-check', 'test:care-first-screen', 'test:task-entry']],
  ['GP-005', ['test:collection-swipe-cards', 'test:collection-hub-ui', 'test:responsive-detail-surface']],
]);

for (const path of spec.paths) {
  const required = crossJourneyRequired.get(path.id) || [];
  for (const command of required) {
    assert.ok(path.existingAutomation.includes(command), `${path.id} must keep ${command} in its acceptance evidence`);
  }
}

const uncovered = spec.paths.filter(path => !allowedCoverage.has(path.coverage));
assert.equal(uncovered.length, 0, 'No Golden Path may remain unclassified');

const partial = spec.paths.filter(path => path.coverage === 'partial').map(path => path.id);
console.log(`Golden Path v1 contract valid: ${spec.paths.length} journeys. Partial end-to-end coverage still to close: ${partial.join(', ') || 'none'}.`);
