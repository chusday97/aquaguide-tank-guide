import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'docs/PROJECT_TRUTH.md',
  'docs/HISTORICAL_EVIDENCE.md',
  'docs/01-definition/PRODUCT_TRUTH.md',
  'docs/01-definition/FEATURE_CATALOG.md',
  'docs/02-design/VISUAL_BASELINE.md',
  'docs/03-development/DEPLOYMENT_STATE.md',
  'docs/05-validation/VISUAL_ACCEPTANCE_MATRIX.md',
  'docs/05-validation/MODULE_FACT_INVENTORY.md',
  'docs/03-development/PR_CLEANUP_RECORD.md',
  'docs/03-development/BRANCH_CONVERGENCE_AUDIT.md',
  '.ai/PROJECT_STATE.json',
  '.ai/OPEN_PR_REGISTRY.md',
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing canonical truth file: ${file}`);
}

const state = JSON.parse(readFileSync(resolve(root, '.ai/PROJECT_STATE.json'), 'utf8'));
if (state.canonicalBranch !== 'codex/unified-rc-visual-v1') {
  throw new Error(`Unexpected canonical branch: ${state.canonicalBranch}`);
}
if (state.activePullRequest !== 141) {
  throw new Error(`Unexpected active convergence PR: ${state.activePullRequest}`);
}

const projectTruth = readFileSync(resolve(root, 'docs/PROJECT_TRUTH.md'), 'utf8');
for (const label of ['Product Truth', 'Feature Catalog', 'Visual Baseline', 'Deployment State', 'Historical Evidence Registry', 'Module Fact Inventory']) {
  if (!projectTruth.includes(label)) throw new Error(`Project Truth is missing route: ${label}`);
}

const catalog = readFileSync(resolve(root, 'docs/01-definition/FEATURE_CATALOG.md'), 'utf8');
for (const status of ['CURRENT_VERIFIED', 'DEPLOYED_REVERIFY_PENDING', 'PARTIAL_WITH_FALLBACK', 'RC_MIGRATION_PROPOSED', 'HISTORICAL_OR_EXCLUDED']) {
  if (!catalog.includes(status)) throw new Error(`Feature Catalog is missing status: ${status}`);
}

const visual = readFileSync(resolve(root, 'docs/02-design/VISUAL_BASELINE.md'), 'utf8');
if (!visual.includes(state.localPreview)) throw new Error('Visual Baseline must name the approved local preview.');

const deployment = readFileSync(resolve(root, 'docs/03-development/DEPLOYMENT_STATE.md'), 'utf8');
if (!deployment.includes('user-confirmed') || !deployment.includes('parity')) {
  throw new Error('Deployment State must distinguish deployed evidence from parity evidence.');
}

console.log('project truth contract: PASS');
