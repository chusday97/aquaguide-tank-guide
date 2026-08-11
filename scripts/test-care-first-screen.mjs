import fs from 'node:fs';

const source = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');
const checks = [
  [source.includes('data-care-first-screen'), 'care detail must expose a first-screen task surface'],
  [source.includes('data-care-first-screen-primary'), 'diagnosis must expose its primary action above the fold'],
  [source.includes('data-care-first-screen-checklist'), 'care checklist must expose actionable items above the fold'],
  [source.includes('data-care-first-screen-key-points'), 'knowledge guides must expose key points above the fold'],
  [source.includes('data-care-detail-hero className="order-2'), 'mobile hero must follow task content'],
  [source.includes('h-[180px] w-full rounded-[20px]'), 'mobile hero height must stay secondary'],
  [source.includes("meta.guideType !== 'diagnosis' && meta.guideType !== 'knowledge'"), 'diagnosis and knowledge guides must not depend on the bottom footer for their main task'],
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  for (const [, message] of failed) console.error('FAIL:', message);
  process.exit(1);
}
console.log('Care first-screen interaction contract: OK');
