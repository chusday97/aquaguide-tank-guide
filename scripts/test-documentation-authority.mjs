import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const docsReadmePath = resolve(root, 'docs/README.md');
const docsReadme = readFileSync(docsReadmePath, 'utf8');

assert.match(docsReadme, /最后核对：2026-10-17/);
assert.match(docsReadme, /唯一阅读入口/);
assert.match(docsReadme, /CURRENT_PRODUCT_STATUS\.md/);
assert.match(docsReadme, /PRODUCT_GAPS_AND_ROADMAP\.md/);
assert.match(docsReadme, /readiness:production-preflight/);

const currentSection = docsReadme.split('## 历史资料')[0];
for (const forbidden of [
  'PROJECT_TRUTH.md',
  'UX_REFACTOR_PRD.md',
  'UX_REFACTOR_CONCEPTS.md',
  'UX_REFACTOR_INTERACTION.md',
  'UX_REFACTOR_TECH.md',
  'aquaguide_functional_analysis.md',
  'interaction_review.md',
  'UX_NAVIGATION_AUDIT.md',
  'DEPLOYMENT_STATE.md',
  'interaction-rules.md',
]) {
  assert.equal(currentSection.includes(forbidden), false, `current docs map must not route through historical/missing source: ${forbidden}`);
}

const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
for (const match of docsReadme.matchAll(linkPattern)) {
  const href = match[1].trim();
  if (!href || href.startsWith('#') || /^(https?:|mailto:)/.test(href)) continue;
  const clean = href.split('#')[0].split('?')[0];
  assert.equal(existsSync(resolve(dirname(docsReadmePath), clean)), true, `docs/README.md link must resolve: ${href}`);
}

const productStatus = readFileSync(resolve(root, 'docs/01-definition/CURRENT_PRODUCT_STATUS.md'), 'utf8');
assert.match(productStatus, /快照日期：2026-10-17/);
assert.match(productStatus, /当前能力 authority/);

const roadmap = readFileSync(resolve(root, 'docs/04-planning/PRODUCT_GAPS_AND_ROADMAP.md'), 'utf8');
assert.match(roadmap, /记录日期：2026-10-17/);
assert.match(roadmap, /\| P1-05 \|[^\n]+\| 已完成 \|/);

const historical = [
  'docs/PROJECT_TRUTH.md',
  'docs/03-development/DEPLOYMENT_STATE.md',
  'docs/01-definition/UX_REFACTOR_PRD.md',
  'docs/02-design/UX_REFACTOR_CONCEPTS.md',
  'docs/02-design/UX_REFACTOR_INTERACTION.md',
  'docs/03-development/UX_REFACTOR_TECH.md',
];
for (const relative of historical) {
  const head = readFileSync(resolve(root, relative), 'utf8').slice(0, 1400);
  assert.match(head, /历史|Historical|Superseded/, `${relative} must declare historical/superseded status near the top`);
}

const registry = readFileSync(resolve(root, 'docs/HISTORICAL_EVIDENCE.md'), 'utf8');
assert.match(registry, /当前文档入口/);
assert.doesNotMatch(registry, /Start from \[Project Truth\]/);

console.log('documentation authority map verified: one current entry, live local links, historical sources quarantined, and P1-05 closed');
