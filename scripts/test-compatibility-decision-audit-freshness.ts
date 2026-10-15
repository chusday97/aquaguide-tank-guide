import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const path = 'docs/compatibility_decision_audit.json';
const committed = readFileSync(path, 'utf8');
let generated = committed;
try {
  const result = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/generate-compatibility-decision-audit.ts'], {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr || result.stdout || 'decision audit generator failed');
  generated = readFileSync(path, 'utf8');
} finally {
  writeFileSync(path, committed);
}
assert.equal(generated, committed, 'compatibility_decision_audit.json is stale; regenerate it from current source-controlled authority');
console.log('Compatibility decision-audit freshness PASS: committed decision-impact queue exactly matches current runtime/source authority.');
