import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const path = resolve(root, '.artifacts/readiness/latest.json');
if (!existsSync(path)) throw new Error('Run npm run readiness:collect before test:readiness.');
const report = JSON.parse(readFileSync(path, 'utf8'));
const allowed = new Set(['PASS', 'FAIL', 'BLOCKED', 'UNVERIFIED', 'USER_ACCEPTANCE_REQUIRED']);
if (!/^[0-9a-f]{40}$/.test(report.evaluatedSha)) throw new Error('Readiness report must use a full evaluated SHA.');
if (!report.branch || !report.evaluatedAt) throw new Error('Readiness report is missing branch or timestamp.');
if (report.worktreeClean !== (report.project?.dirty === false)) throw new Error('Readiness worktreeClean flag must match project status.');
if (!report.readiness || !['PASS', 'BLOCKED'].includes(report.readiness.mainConvergence) || !['PASS', 'BLOCKED'].includes(report.readiness.productionRelease)) throw new Error('Readiness report has invalid top-level readiness.');
if (!Array.isArray(report.gates) || report.gates.length < 10) throw new Error('Readiness report must include the expected gate set.');
for (const gate of report.gates) {
  if (!gate.gateId || !allowed.has(gate.status) || gate.evaluatedSha !== report.evaluatedSha || !gate.expected || !gate.actual) throw new Error(`Invalid readiness gate: ${gate.gateId ?? 'unknown'}`);
}
if (!Array.isArray(report.businessCases) || report.businessCases.length < 5) throw new Error('Readiness report must include fixed business cases.');
const uiGate = report.gates.find(gate => gate.gateId === 'ui-freeze');
if (!uiGate || (report.worktreeClean && uiGate.status !== 'USER_ACCEPTANCE_REQUIRED') || (!report.worktreeClean && uiGate.status !== 'UNVERIFIED')) throw new Error('Current UI acceptance must remain explicit and cannot be trusted from a dirty worktree.');
if (!report.gates.some(gate => gate.gateId === 'production-freeze' && gate.status === 'BLOCKED')) throw new Error('Production freeze must remain explicit until provider settings are read back.');
console.log(`readiness evidence contract passed: ${report.gates.length} gates, ${report.businessCases.length} cases, SHA ${report.evaluatedSha}`);
