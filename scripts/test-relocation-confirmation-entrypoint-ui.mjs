import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const panel = readFileSync('src/components/compatibility/InterventionComparisonPanel.tsx', 'utf8');
const model = readFileSync('src/lib/relocationConfirmationEntrypoint.ts', 'utf8');

// Entrypoint remains mutation-free and cannot bypass PR #63.
for (const forbidden of [
  'AquaGuideRepository',
  'relocateLivestock(',
  'apiRequest(',
  "from '@supabase",
  "from '../services/repository",
  "from '../../services/repository",
]) {
  assert.doesNotMatch(panel, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

assert.match(panel, /onOpenRelocationConfirmation\?\.\(entrypoint\.candidate\)/);
assert.match(panel, /data-open-relocation-confirmation/);
assert.match(panel, /当前卡片不是执行授权/);
assert.match(panel, /data-intervention-panel-mutation-free="true"/);

// Current destination verdict may decide whether the opener is shown, but must
// not be serialized into the launch candidate as future mutation authorization.
assert.match(model, /destination\.status !== 'compatible_by_current_evidence'/);
assert.match(model, /intentionally not copied into the candidate as execution authorization/);
assert.doesNotMatch(model, /candidate:\s*\{[^}]*\b(isSafe|allowed|expectedCompatibility|compatibilityStatus|verdict)\b/s);
assert.doesNotMatch(model, /operationId\s*:/);

// Never collapse ambiguous factual scope by choosing an arbitrary first record
// or first batch. Exact single-record + single-positive-batch gates are required.
assert.match(model, /sourceRecordIds\.length !== 1/);
assert.match(model, /positiveBatches\.length !== 1/);
assert.doesNotMatch(panel, /batches\?\.\[0\]|batches\[0\]/);

// Multi-record / multi-batch limitations must be visible rather than silently
// hiding the execution boundary.
assert.match(panel, /multiple_source_records/);
assert.match(panel, /multiple_positive_source_batches/);
assert.match(panel, /当前单记录迁移还不能完整执行这个方案/);
assert.match(panel, /当前不能把单批次迁移当作完整方案执行/);

console.log('relocation confirmation entrypoint UI contract passed: eligible cards may open confirmation only; panel has no mutation dependency or cached-verdict authorization');
