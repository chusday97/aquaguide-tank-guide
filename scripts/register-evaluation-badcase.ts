import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { badcaseSchema, evaluationResultSchema, type EvaluationBadcase } from '../evaluation/schemas/evaluation-case.schema';

const resultArg = process.argv.find(value => value.startsWith('--result='))?.slice('--result='.length);
const layerArg = process.argv.find(value => value.startsWith('--layer='))?.slice('--layer='.length) || 'workflow';
if (!resultArg) throw new Error('Usage: npm run eval:register-badcase -- --result=evaluation/reports/deterministic.json [--layer=rule]');
const allowedLayers = ['data', 'rule', 'prompt', 'model', 'api', 'workflow', 'ui', 'analytics'];
if (!allowedLayers.includes(layerArg)) throw new Error(`Unsupported rootCauseLayer: ${layerArg}`);

const results = evaluationResultSchema.array().parse(JSON.parse(readFileSync(resolve(resultArg), 'utf8')));
const failures = results.filter(result => !result.passed);
const registryPath = resolve('evaluation/badcases/registry.jsonl');
const existingText = readFileSync(registryPath, 'utf8').trim();
const existing = existingText ? existingText.split(/\r?\n/).map(line => badcaseSchema.parse(JSON.parse(line))) : [];
const byCase = new Map(existing.map(item => [item.evaluationCaseId, item]));

failures.forEach(result => {
  const current = byCase.get(result.caseId);
  const next: EvaluationBadcase = badcaseSchema.parse({
    id: current?.id || `badcase-${result.caseId}`,
    evaluationCaseId: result.caseId,
    task: result.task,
    discoveredAt: current?.discoveredAt || new Date().toISOString(),
    source: result.runner,
    severity: result.severity,
    symptom: result.failures.join('; '),
    expectedBehavior: 'Evaluation case expectations pass',
    actualBehavior: result.safeSummary ? JSON.stringify(result.safeSummary) : result.failureReason || 'No safe summary',
    rootCause: current?.rootCause || 'Pending investigation',
    rootCauseLayer: current?.rootCauseLayer || layerArg,
    status: current?.status || 'open',
    fixedByCommit: current?.fixedByCommit,
    regressionCaseId: current?.regressionCaseId,
    modelVersion: result.modelVersion,
    promptVersion: result.promptVersion,
  });
  byCase.set(result.caseId, next);
});

writeFileSync(registryPath, [...byCase.values()].map(item => JSON.stringify(item)).join('\n') + (byCase.size ? '\n' : ''));
console.log(`badcase registry: ${failures.length} failed result(s) registered or updated`);
