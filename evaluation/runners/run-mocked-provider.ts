import { evaluateCase } from './evaluate-case';
import { readEvaluationCases, writeResults } from './io';

const files = [
  'evaluation/datasets/tank-copilot.v1.jsonl',
  'evaluation/datasets/daily-check.v1.jsonl',
  'evaluation/datasets/species-diagnosis.v1.jsonl',
];
const cases = readEvaluationCases(files).filter(testCase => testCase.input.runner === 'mocked_provider');
const results = [];
for (const testCase of cases) results.push(await evaluateCase(testCase, 'mocked_provider'));
const path = writeResults('mocked-provider', results);
const failures = results.filter(result => !result.passed);

console.log(`mocked provider evaluation: ${results.length - failures.length}/${results.length} passed`);
console.log(`report input: ${path}`);
failures.forEach(result => console.error(`FAIL ${result.caseId}: ${result.failures.join('; ')}`));
if (failures.length) process.exitCode = 1;
