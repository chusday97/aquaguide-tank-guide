import fs from 'node:fs';

const path = 'src/components/CompatibilityRiskCalculator.tsx';
let source = fs.readFileSync(path, 'utf8');

const replacements = [
  [
    '<header className="flex flex-wrap items-start justify-between gap-3 pr-12">',
    '<header className="order-1 flex flex-wrap items-start justify-between gap-3 pr-12">',
    'header order',
  ],
  [
    '<section className="rounded-[18px] bg-bg/65 p-3">',
    '<section className="order-2 rounded-[18px] bg-bg/65 p-3">',
    'baseline order',
  ],
  [
    '<section className="grid gap-3 rounded-[18px] border border-border/70 p-3">',
    '<section data-compatibility-selection className={`${canEvaluate && resultStatus && meta ? \'order-4\' : \'order-3\'} grid gap-3 rounded-[18px] border border-border/70 p-3`}>',
    'selection conditional order',
  ],
  [
    '<section className="grid gap-3">\n        <div className="flex items-center justify-between gap-2">\n          <div className="text-[13px] font-black text-ink">{isEn ? \'Compatibility result\' : \'混养结果\'}</div>',
    '<section data-compatibility-result className={`${canEvaluate && resultStatus && meta ? \'order-3\' : \'order-4\'} grid gap-3`}>\n        <div className="flex items-center justify-between gap-2">\n          <div className="text-[13px] font-black text-ink">{isEn ? \'Compatibility result\' : \'混养结果\'}</div>',
    'result conditional order',
  ],
  [
    '<section data-ai-advice-inline className="rounded-[22px] border border-violet-100 bg-violet-50/55 p-4 sm:p-5">',
    '<section data-ai-advice-inline className="order-5 rounded-[22px] border border-violet-100 bg-violet-50/55 p-4 sm:p-5">',
    'AI explanation order',
  ],
];

for (const [before, after, label] of replacements) {
  if (source.includes(after)) continue;
  if (!source.includes(before)) throw new Error(`${label}: anchor not found`);
  source = source.replace(before, after);
  console.log(`patched ${label}`);
}

fs.writeFileSync(path, source);
console.log('PASS: compatibility result now moves ahead of the selector only when an evaluable verdict exists.');
