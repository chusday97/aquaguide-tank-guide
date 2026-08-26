import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflowPath = '.github/workflows/result-ux-head-integrity-v1.yml';
const workflow = fs.readFileSync(workflowPath, 'utf8');

assert.ok(
  workflow.includes('ref: ${{ github.event.pull_request.head.sha || github.sha }}'),
  'Result UX checkout must bind to the pull-request head or the exact pushed SHA',
);
assert.ok(
  workflow.includes('EXPECTED_HEAD_SHA: ${{ github.event.pull_request.head.sha || github.sha }}')
    && workflow.includes('git rev-parse HEAD'),
  'Result UX must verify the checked-out commit matches the candidate SHA',
);
assert.ok(
  workflow.includes('      - main') && workflow.includes('      - integration/aquaguide-rc1'),
  'Result UX must protect both main-bound release PRs and RC1-bound candidate PRs',
);
assert.ok(
  workflow.includes('      - codex/unified-rc-visual-v1'),
  'Result UX head integrity must also run on the canonical branch push',
);
assert.equal(
  workflow.includes('ref: agent/result-ux-v1') || workflow.includes('      - agent/uiux-system-refactor-v1'),
  false,
  'Result UX must not validate a fixed legacy branch',
);

console.log('Result UX workflow head-integrity contract PASS');
