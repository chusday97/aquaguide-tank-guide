import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/result-ux-v1.yml', 'utf8');

assert.equal(
  workflow.includes('ref: agent/result-ux-v1'),
  false,
  'Result UX must not validate a fixed legacy branch',
);
assert.ok(
  workflow.includes('ref: ${{ github.event.pull_request.head.sha }}'),
  'Result UX checkout must bind to the current pull-request head SHA',
);
assert.ok(
  workflow.includes('      - main') && workflow.includes('      - integration/aquaguide-rc1'),
  'Result UX must protect both main-bound release PRs and RC1-bound candidate PRs',
);
assert.equal(
  workflow.includes('      - agent/uiux-system-refactor-v1'),
  false,
  'Result UX must not retain the retired experimental target branch',
);

console.log('Result UX workflow head-integrity contract PASS');
