import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  diagnosisProblemTypes,
  getDiagnosisQuestions,
} from '../src/modules/diagnosis/diagnosis.questionBank';
import {
  getDiagnosisProblemPresentation,
  getDiagnosisQuestionPresentation,
  isDiagnosisPresentationEnglishComplete,
} from '../src/modules/diagnosis/diagnosis.presentation';
import type { DiagnosisQuestion } from '../src/modules/diagnosis/diagnosis.types';

const hasCjk = (value: string) => /[\u3400-\u9fff]/.test(value);

for (const problem of diagnosisProblemTypes) {
  const presentation = getDiagnosisProblemPresentation(problem.id, true);
  assert.equal(hasCjk(presentation.label), false, `English problem label contains CJK: ${problem.id}`);
  assert.equal(hasCjk(presentation.description), false, `English problem description contains CJK: ${problem.id}`);
  assert.ok(presentation.label.trim());
  assert.ok(presentation.description.trim());
}

const allQuestions = new Map<string, DiagnosisQuestion>();
const addQuestions = (questions: DiagnosisQuestion[]) => {
  for (const question of questions) {
    const key = JSON.stringify([question.id, question.question, question.options]);
    allQuestions.set(key, question);
  }
};

for (const problem of diagnosisProblemTypes) {
  addQuestions(getDiagnosisQuestions(problem.id, {}));
}
for (const stage of ['母鱼肚子变大', '已经看到小鱼', '不知道是不是怀孕']) {
  addQuestions(getDiagnosisQuestions('怀孕/鱼苗', { stage }));
}

assert.ok(allQuestions.size >= 70, `expected full diagnosis coverage, got ${allQuestions.size}`);
for (const question of allQuestions.values()) {
  const english = getDiagnosisQuestionPresentation(question, true);
  assert.equal(isDiagnosisPresentationEnglishComplete(question), true, `English presentation incomplete: ${question.question}`);
  assert.equal(hasCjk(english.question), false, `English question contains CJK: ${question.question}`);
  assert.deepEqual(english.options.map(option => option.value), question.options, 'presentation must preserve canonical option values');
  for (const option of english.options) {
    assert.equal(hasCjk(option.label), false, `English option label contains CJK: ${option.value}`);
    assert.ok(option.label.trim());
  }

  const chinese = getDiagnosisQuestionPresentation(question, false);
  assert.equal(chinese.question, question.question);
  assert.deepEqual(chinese.options, question.options.map(value => ({ value, label: value })));
}

const aquariumSource = readFileSync(resolve('src/pages/Aquarium.tsx'), 'utf8');
assert.match(aquariumSource, /getDiagnosisQuestionPresentation\(question, isEn\)/);
assert.match(aquariumSource, /handleDiagnosisChoice\(question\.id, option\.value\)/);
assert.match(aquariumSource, /handleDiagnosisChoice\(activeDiagnosisQuestion\.id, option\.value\)/);
assert.match(aquariumSource, /getDiagnosisProblemPresentation\(type\.id, true\)/);
assert.doesNotMatch(aquariumSource, />\{question\.question\}<\/div>/);
assert.doesNotMatch(aquariumSource, />\{option\}<\/button>/);

console.log(`diagnosis presentation i18n verified: ${diagnosisProblemTypes.length} problem types and ${allQuestions.size} question variants localize labels while preserving canonical rule values`);
