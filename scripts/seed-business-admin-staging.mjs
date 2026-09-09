import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  buildBusinessAdminStagingCompatibilityArgs,
  buildBusinessAdminStagingImportArgs,
  resolveBusinessAdminStagingSeedConfig,
} from '../apps/admin-content/scripts/business-admin-staging-seed.mjs';

const root = resolve(import.meta.dirname, '..');
const args = new Set(process.argv.slice(2));
const allowed = new Set(['--commit']);
const unknown = [...args].filter(arg => !allowed.has(arg));
if (unknown.length) throw new Error(`Unsupported staging seed option(s): ${unknown.join(', ')}`);
const commit = args.has('--commit');
const config = resolveBusinessAdminStagingSeedConfig(process.env);

const runPreflight = () => {
  const result = spawnSync(process.execPath, ['scripts/check-business-admin-staging-readiness.mjs'], {
    cwd: root, env: process.env, encoding: 'utf8',
  });
  let report;
  try { report = JSON.parse(result.stdout || '{}'); }
  catch { throw new Error(`Unable to parse staging preflight output: ${result.stderr || result.stdout}`); }
  return { result, report };
};

if (commit) {
  const { report } = runPreflight();
  if (!report.schema_ready) {
    throw new Error(`Refusing staging seed before schema is ready. Missing: ${(report.schema_missing || []).join(', ') || 'unknown'}`);
  }
}

console.log(JSON.stringify({
  mode: commit ? 'commit' : 'dry-run',
  target_project_ref: config.targetProjectRef,
  production_refused: config.targetProjectRef !== process.env.PRODUCTION_SUPABASE_PROJECT_REF,
  content_status: 'published',
  assets: 'metadata-only',
}, null, 2));

const importer = spawnSync(process.execPath, buildBusinessAdminStagingImportArgs({ commit }), {
  cwd: root, env: config.childEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});
process.stdout.write(importer.stdout || '');
process.stderr.write(importer.stderr || '');
if (importer.status !== 0) process.exit(importer.status || 1);

const compatibility = spawnSync(process.execPath, buildBusinessAdminStagingCompatibilityArgs({ commit }), {
  cwd: root, env: config.childEnv, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});
process.stdout.write(compatibility.stdout || '');
process.stderr.write(compatibility.stderr || '');
if (compatibility.status !== 0) process.exit(compatibility.status || 1);

if (commit) {
  const { report } = runPreflight();
  console.log(JSON.stringify({
    post_seed_acceptance_ready: Boolean(report.acceptance_ready),
    remaining_data_gaps: report.data_gaps || [],
  }, null, 2));
}
