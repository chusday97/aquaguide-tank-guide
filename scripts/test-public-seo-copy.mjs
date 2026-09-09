import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicPageFiles = [
  'src/pages/MarketingLanding.tsx',
  'src/pages/CategoryLanding.tsx',
  'src/pages/SpeciesLanding.tsx',
  'src/pages/CareGuideLanding.tsx',
];
const forbiddenPublicCopy = [
  /Product Truth/i,
  /Base Species/i,
  /Publish Gate/i,
  /Override/i,
  /已核对资料/,
  /现有审核记录/,
  /进入公开路径/,
  /内容责任/,
  /事实审核/,
  /审核记录/,
  /只显示有来源/,
  /只呈现有依据/,
];

for (const relativeFile of publicPageFiles) {
  const file = path.join(root, relativeFile);
  const source = fs.readFileSync(file, 'utf8');
  const matches = forbiddenPublicCopy.filter(pattern => pattern.test(source));
  if (matches.length > 0) {
    throw new Error(`${relativeFile} contains forbidden public copy: ${matches.map(pattern => pattern.source).join(', ')}`);
  }
}

const guideSource = fs.readFileSync(path.join(root, 'src/pages/CareGuideLanding.tsx'), 'utf8');
for (const phrase of ['先看核心结论', '再看分步操作', '最后做后续观察', '资料状态']) {
  if (!guideSource.includes(phrase)) throw new Error(`Guide preparation state is missing: ${phrase}`);
}

console.log('Public SEO copy checks passed: user-facing language is clean and Guide preparation state has distinct next steps.');
