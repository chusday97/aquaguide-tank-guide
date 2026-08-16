import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const care = readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');

for (const marker of [
  'data-care-step-diagnosis="true"',
  'data-care-diagnosis-issue={issue.id}',
  'data-care-diagnosis-question={question.id}',
  'data-care-diagnosis-option={`${question.id}:${option.value}`}',
  'data-care-diagnosis-submit="true"',
]) {
  assert.match(care, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

console.log('Care browser markers contract passed: rendered diagnosis issue/question/option/submit path has stable non-semantic selectors');
