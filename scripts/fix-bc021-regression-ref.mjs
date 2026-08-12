import fs from 'node:fs';

const path = 'evaluation/product/badcases.v1.jsonl';
const lines = fs.readFileSync(path, 'utf8').trimEnd().split('\n').map(line => JSON.parse(line));
const item = lines.find(entry => entry.id === 'PUI-BC-021');
if (!item) throw new Error('PUI-BC-021 not found');
item.regression = 'test:compatibility-evidence-coverage + test:golden-path-gp002-ui + audit:compatibility-evidence';
fs.writeFileSync(path, `${lines.map(entry => JSON.stringify(entry)).join('\n')}\n`);
console.log('PUI-BC-021 regression reference updated to durable commands.');
