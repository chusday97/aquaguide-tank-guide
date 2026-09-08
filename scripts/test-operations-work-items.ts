import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCompatibilityWorkItems, buildContentWorkItems, buildSeoWorkItems, sortOperationsWorkItems } from '../src/services/admin/operations-work-item.service';

const seo = buildSeoWorkItems({
  entries: [
    { health: { severity: 'blocked', issues: ['missing_h1'] }, editorialState: 'editing' },
    { health: { severity: 'attention', issues: ['missing_editorial_review'] }, editorialState: 'ready_for_review' },
    { health: { severity: 'unknown', issues: ['source_state_unknown'] }, editorialState: 'unknown' },
  ] as any,
  sources: [],
});
assert.equal(seo.find(item => item.id === 'seo:blocked')?.count, 1);
assert.equal(seo.find(item => item.id === 'seo:review')?.count, 1);
assert.equal(seo.find(item => item.id === 'seo:attention')?.count, 1);
assert.equal(seo.some(item => item.title.includes('unknown')), false, 'Unknown source state must not become a work item.');

const content = buildContentWorkItems(
  [{ id: 'sp1', status: 'draft', version: 1 } as any, { id: 'sp2', status: 'published', version: 1 } as any],
  [{ id: 'care1', status: 'draft', version: 2 } as any],
);
assert.equal(content.find(item => item.id === 'product:drafts')?.count, 1);
assert.equal(content.find(item => item.id === 'care:drafts')?.count, 1);

const compatibility = buildCompatibilityWorkItems(
  [{ id: 'r1', status: 'pending_review' } as any, { id: 'r2', status: 'draft' } as any],
  [{ id: 'p1', status: 'approved' } as any],
);
assert.equal(compatibility.find(item => item.id === 'compatibility:review')?.count, 1);
assert.equal(compatibility.find(item => item.id === 'compatibility:drafts')?.count, 1);
assert.equal(compatibility.find(item => item.id === 'compatibility:approved')?.count, 1);
assert.equal(compatibility.find(item => item.id === 'compatibility:approved')?.severity, 'attention', 'Approved revision still needs publish-gate verification.');

const sorted = sortOperationsWorkItems([...content, ...compatibility, ...seo]);
assert.equal(sorted[0]?.severity, 'blocker');
assert.equal(sorted[1]?.severity, 'decision');
const firstDecision = sorted.findIndex(item => item.severity === 'decision');
const firstAttention = sorted.findIndex(item => item.severity === 'attention');
assert.ok(firstDecision > 0 && firstAttention > firstDecision, 'WorkItems must sort blocker → decision → attention.');
console.log(JSON.stringify({ gate: 'PASS', workItems: sorted.length, first: sorted[0]?.id }));

const serviceSource = fs.readFileSync(new URL('../src/services/admin/operations-work-item.service.ts', import.meta.url), 'utf8');
assert.doesNotMatch(serviceSource, /\.(create|update|submit|approve|publish)[A-Z][A-Za-z]+\(/, 'Operations WorkItem aggregation must remain read-only.');
