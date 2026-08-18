import fs from 'node:fs';

const replaceOnce = (path, before, after, label) => {
  const source = fs.readFileSync(path, 'utf8');
  if (source.includes(after)) return;
  if (!source.includes(before)) throw new Error(`${label}: anchor not found in ${path}`);
  fs.writeFileSync(path, source.replace(before, after));
  console.log(`patched ${label}`);
};

const productPath = 'src/components/CompatibilityRiskCalculator.tsx';
const productReplacements = [
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

let product = fs.readFileSync(productPath, 'utf8');
for (const [before, after, label] of productReplacements) {
  if (product.includes(after)) continue;
  if (!product.includes(before)) throw new Error(`${label}: anchor not found in ${productPath}`);
  product = product.replace(before, after);
  console.log(`patched ${label}`);
}
fs.writeFileSync(productPath, product);

replaceOnce(
  'scripts/test-ui-interaction-repair-v1.mjs',
  `assert(compatibility.includes('data-verdict-symbol={verdictCue?.symbol}'), 'Compatibility verdict must provide a scan-first symbol');\nassert(compatibility.includes('信息不足 ≠ 安全'), 'Unknown must not visually/semantically collapse into safe');`,
  `assert(compatibility.includes('data-verdict-symbol={verdictCue?.symbol}'), 'Compatibility verdict must provide a scan-first symbol');\nassert(compatibility.includes('data-compatibility-result'), 'Compatibility result must expose a stable primary-result section');\nassert(compatibility.includes("canEvaluate && resultStatus && meta ? 'order-3' : 'order-4'"), 'Evaluable compatibility result must move ahead of the species selector');\nassert(compatibility.includes("canEvaluate && resultStatus && meta ? 'order-4' : 'order-3'"), 'Species selector must move behind an existing compatibility result');\nassert(compatibility.includes('信息不足 ≠ 安全'), 'Unknown must not visually/semantically collapse into safe');`,
  'source contract result priority',
);

replaceOnce(
  'scripts/verify-ui-interaction-repair-v1.mjs',
  `    const symbolBox = await symbol.boundingBox();\n    assert.ok(symbolBox && symbolBox.width >= 50 && symbolBox.height >= 50, 'Compatibility verdict symbol must visually dominate paragraph copy.');\n    assert.equal(await page.locator('dialog').filter({ hasText: '为什么会这样' }).count(), 0, 'Compatibility explanation must not pre-render as a nested dialog.');`,
  `    const symbolBox = await symbol.boundingBox();\n    assert.ok(symbolBox && symbolBox.width >= 50 && symbolBox.height >= 50, 'Compatibility verdict symbol must visually dominate paragraph copy.');\n    const verdictBox = await verdict.boundingBox();\n    const selectorBox = await page.locator('[data-compatibility-selection]').boundingBox();\n    assert.ok(verdictBox && selectorBox && verdictBox.y < selectorBox.y, \`Compatibility result must appear before the selector once a verdict exists; verdictY=\${verdictBox?.y}, selectorY=\${selectorBox?.y}.\`);\n    assert.equal(await page.locator('dialog').filter({ hasText: '为什么会这样' }).count(), 0, 'Compatibility explanation must not pre-render as a nested dialog.');`,
  'browser geometry result priority',
);

console.log('PASS: compatibility result now moves ahead of the selector only when an evaluable verdict exists, with source/browser regressions updated.');
