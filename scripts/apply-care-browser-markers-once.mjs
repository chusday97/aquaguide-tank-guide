import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/CareEncyclopedia.tsx';

const replaceOnce = (before, after) => {
  const content = readFileSync(path, 'utf8');
  const count = content.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected exactly one anchor, found ${count}`);
  writeFileSync(path, content.replace(before, after));
};

replaceOnce(
  `  return (\n    <section className="mt-4 rounded-[22px] border border-emerald-100 bg-[#F8FCF8] p-3 shadow-sm">\n`,
  `  return (\n    <section data-care-step-diagnosis="true" className="mt-4 rounded-[22px] border border-emerald-100 bg-[#F8FCF8] p-3 shadow-sm">\n`,
);

replaceOnce(
  `                    key={issue.id}\n                    type="button"\n                    onClick={() => setDiagnosisState(prev => ({\n`,
  `                    key={issue.id}\n                    type="button"\n                    data-care-diagnosis-issue={issue.id}\n                    onClick={() => setDiagnosisState(prev => ({\n`,
);

replaceOnce(
  `              <div key={question.id} className="rounded-[18px] bg-white p-3 shadow-sm">\n`,
  `              <div key={question.id} data-care-diagnosis-question={question.id} className="rounded-[18px] bg-white p-3 shadow-sm">\n`,
);

replaceOnce(
  `                        key={option.value}\n                        type="button"\n                        onClick={() => updateAnswer(question.id, option.value)}\n`,
  `                        key={option.value}\n                        type="button"\n                        data-care-diagnosis-option={\`\${question.id}:\${option.value}\`}\n                        onClick={() => updateAnswer(question.id, option.value)}\n`,
);

replaceOnce(
  `          <Button\n            type="button"\n            onClick={showResult}\n            disabled={!isReady}\n`,
  `          <Button\n            type="button"\n            data-care-diagnosis-submit="true"\n            onClick={showResult}\n            disabled={!isReady}\n`,
);

console.log('Care browser testability markers applied with unique anchors');
