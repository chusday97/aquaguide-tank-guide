import fs from 'node:fs';

const path = 'evaluation/product/badcases.v1.jsonl';
let text = fs.readFileSync(path, 'utf8');
const replacements = [
  ['"id":"PUI-BC-016","featureId":"surface_sizing"', '"id":"PUI-BC-016","featureId":"responsive_detail_surface"'],
  ['"id":"PUI-BC-017","featureId":"collection_swipe_cards"', '"id":"PUI-BC-017","featureId":"collection"'],
  ['"id":"PUI-BC-019","featureId":"design_tokens"', '"id":"PUI-BC-019","featureId":"responsive_detail_surface"'],
];
for (const [before, after] of replacements) {
  if (text.includes(before)) text = text.replace(before, after);
  else if (!text.includes(after)) throw new Error(`Badcase scope anchor missing: ${before}`);
}
fs.writeFileSync(path, text);
console.log('Synced PR #27 badcase feature scopes without touching GP-002 badcases.');
