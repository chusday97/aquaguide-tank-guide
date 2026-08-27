import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  '.ai/PROJECT_STATE.json',
  '.ai/MAIN_CONVERGENCE_LEDGER.md',
  'docs/PROJECT_TRUTH.md',
  'docs/01-definition/PRODUCT_TRUTH.md',
  'docs/01-definition/FEATURE_CATALOG.md',
  'docs/02-design/VISUAL_BASELINE.md',
  'docs/03-development/DEPLOYMENT_STATE.md',
  'docs/05-validation/RELEASE_READINESS.md',
  'HANDOFF_LATEST.md',
  'PROGRESS.md',
];
for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing canonical truth file: ${file}`);
}
const state = JSON.parse(readFileSync(resolve(root, '.ai/PROJECT_STATE.json'), 'utf8'));
if (state.canonicalBranch !== 'codex/main-core-foundation-v1') throw new Error('PROJECT_STATE canonical branch is not the current release candidate.');
if (state.releaseBranch !== 'main') throw new Error('PROJECT_STATE release branch must remain main.');
const ledger = readFileSync(resolve(root, '.ai/MAIN_CONVERGENCE_LEDGER.md'), 'utf8');
for (const status of ['MIGRATED', 'PARTIAL_WITH_FALLBACK', 'PENDING']) {
  if (!ledger.includes(status)) throw new Error(`Convergence ledger is missing status ${status}.`);
}
const readiness = readFileSync(resolve(root, 'docs/05-validation/RELEASE_READINESS.md'), 'utf8');
if (!readiness.includes('NOT_READY')) throw new Error('Release readiness must remain NOT_READY before parity and acceptance.');
console.log('project truth contract: PASS');
