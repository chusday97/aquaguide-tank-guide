import fs from 'node:fs';

const carePath = 'src/pages/CareEncyclopedia.tsx';
const handoffPath = 'HANDOFF.md';
const packagePath = 'package.json';
const testPath = 'scripts/test-care-first-screen.mjs';
const workflowPath = '.github/workflows/care-first-screen-migration.yml';

const replaceOnce = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error(`Missing migration anchor: ${label}`);
  return text.replace(from, to);
};

let care = fs.readFileSync(carePath, 'utf8');

care = replaceOnce(
  care,
  `<div className="grid gap-4 md:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] md:items-stretch">\n            <button type="button" onClick={onPreview} data-care-detail-hero className="block min-w-0" aria-label={isEn ? \`View large image of \${topic.title}\` : \`查看\${topic.title}大图\`}>\n              <CareImage topic={topic} className="h-[270px] w-full rounded-[20px] md:h-full md:min-h-[430px]" showPreviewHint />\n            </button>\n\n            <div className="min-w-0">`,
  `<div className="grid gap-3 md:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] md:items-stretch">\n            <button type="button" onClick={onPreview} data-care-detail-hero className="order-2 block min-w-0 md:order-1" aria-label={isEn ? \`View large image of \${topic.title}\` : \`查看\${topic.title}大图\`}>\n              <CareImage topic={topic} className="h-[180px] w-full rounded-[20px] md:h-full md:min-h-[430px]" showPreviewHint />\n            </button>\n\n            <div className="order-1 min-w-0 md:order-2" data-care-first-screen>`,
  'mobile content before hero',
);

const leadBlock = `              <section className="mt-3 rounded-[18px] border border-emerald-100 bg-emerald-50/55 p-3.5">\n                <div className="text-[12px] font-black text-emerald-800">{detailLead.label}</div>\n                <p className="mt-1 text-[14px] font-black leading-relaxed text-ink">{detailLead.text}</p>\n              </section>\n`;

const firstScreenBlocks = `${leadBlock}              {meta.guideType === 'diagnosis' && !isDiagnosisStarted && (\n                <Button\n                  type="button"\n                  data-care-first-screen-primary\n                  onClick={(event) => handlePrimaryCta(event.currentTarget)}\n                  className="mt-3 h-11 w-full rounded-full bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800"\n                >\n                  {isEn ? 'Start Quick Check' : '开始快速检查'}\n                  <ChevronRight className="ml-1 h-4 w-4" />\n                </Button>\n              )}\n              {meta.guideType === 'careChecklist' && visibleActions.length > 0 && (\n                <section className="mt-3 rounded-[18px] border border-border bg-white p-3 shadow-sm" data-care-first-screen-checklist>\n                  <div className="text-[12px] font-black text-ink">{isEn ? 'Start here' : '现在先做'}</div>\n                  <div className="mt-2 grid gap-2">\n                    {visibleActions.slice(0, 3).map((item, index) => (\n                      <div key={\`first-screen-\${item.title}-\${item.description}\`} className="rounded-[15px] bg-bg/70 p-1">\n                        <ActionStepCard\n                          checked={checkedActions.includes(item.description)}\n                          title={\`\${index + 1}. \${item.title}\`}\n                          description={item.description}\n                          onClick={() => {\n                            setIsChecklistSaved(false);\n                            onToggleAction(item.description);\n                          }}\n                        />\n                      </div>\n                    ))}\n                  </div>\n                  {visibleActions.length > 3 && (\n                    <div className="mt-2 text-[10px] font-bold text-ink/45">\n                      {isEn ? \`\${visibleActions.length - 3} more items below\` : \`下方还有 \${visibleActions.length - 3} 项\`}\n                    </div>\n                  )}\n                </section>\n              )}\n              {meta.guideType === 'knowledge' && visibleActions.length > 0 && (\n                <section className="mt-3 rounded-[18px] border border-border bg-white p-3 shadow-sm" data-care-first-screen-key-points>\n                  <div className="text-[12px] font-black text-ink">{isEn ? 'Key points' : '关键要点'}</div>\n                  <div className="mt-2 grid gap-2">\n                    {visibleActions.slice(0, 2).map((item, index) => (\n                      <div key={\`key-point-\${item.title}-\${item.description}\`} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 rounded-[13px] bg-bg/70 px-2.5 py-2.5">\n                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-800">{index + 1}</span>\n                        <span className="min-w-0">\n                          <span className="block text-[12px] font-black leading-5 text-ink">{item.title}</span>\n                          {item.description && <span className="mt-0.5 block text-[10px] font-medium leading-4 text-ink/55">{item.description}</span>}\n                        </span>\n                      </div>\n                    ))}\n                  </div>\n                </section>\n              )}\n`;
care = replaceOnce(care, leadBlock, firstScreenBlocks, 'first-screen actions');

care = replaceOnce(
  care,
  `{!(meta.guideType === 'diagnosis' && isDiagnosisStarted) && (\n      <div className="modalFooter shrink-0 border-t border-border bg-white/95 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">`,
  `{meta.guideType !== 'diagnosis' && meta.guideType !== 'knowledge' && (\n      <div className="modalFooter shrink-0 border-t border-border bg-white/95 shadow-[0_-12px_30px_rgba(15,23,42,0.08)]">`,
  'footer hierarchy',
);

fs.writeFileSync(carePath, care);

const test = `import fs from 'node:fs';\n\nconst source = fs.readFileSync('src/pages/CareEncyclopedia.tsx', 'utf8');\nconst checks = [\n  [source.includes('data-care-first-screen'), 'care detail must expose a first-screen task surface'],\n  [source.includes('data-care-first-screen-primary'), 'diagnosis must expose its primary action above the fold'],\n  [source.includes('data-care-first-screen-checklist'), 'care checklist must expose actionable items above the fold'],\n  [source.includes('data-care-first-screen-key-points'), 'knowledge guides must expose key points above the fold'],\n  [source.includes('data-care-detail-hero className="order-2'), 'mobile hero must follow task content'],\n  [source.includes('h-[180px] w-full rounded-[20px]'), 'mobile hero height must stay secondary'],\n  [source.includes("meta.guideType !== 'diagnosis' && meta.guideType !== 'knowledge'"), 'diagnosis and knowledge guides must not depend on the bottom footer for their main task'],\n];\n\nconst failed = checks.filter(([ok]) => !ok);\nif (failed.length) {\n  for (const [, message] of failed) console.error('FAIL:', message);\n  process.exit(1);\n}\nconsole.log('Care first-screen interaction contract: OK');\n`;
fs.writeFileSync(testPath, test);

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts = pkg.scripts || {};
pkg.scripts['test:care-first-screen'] = 'node scripts/test-care-first-screen.mjs';
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

let handoff = fs.readFileSync(handoffPath, 'utf8');
const marker = '## First-screen task contract (2026-08-11)';
if (!handoff.includes(marker)) {
  const section = `\n${marker}\n\n- Detail pages must show the user's core conclusion, next action, or primary control in the first viewport. Users should not need to scroll to discover what the page is for.\n- On mobile, task content comes before decorative/supporting media. Hero imagery is secondary to the task.\n- Care guides follow: title/risk → conclusion → immediate steps/check/start action → supporting image → detailed explanation/sources/related content.\n- Secondary actions such as favorite, reminder, sources, and related reading must not outrank the core care task.\n- Knowledge guides are for understanding first; “save to collection” is not treated as the primary CTA.\n- This is a product interaction rule, not only a Care-page styling preference. New detail flows should follow the same first-screen principle.\n`;
  const heading = '# AquaGuide 交接文档';
  if (handoff.includes(heading)) handoff = handoff.replace(heading, `${heading}\n${section}`);
  else handoff = `${section}\n${handoff}`;
  fs.writeFileSync(handoffPath, handoff);
}

for (const path of ['scripts/temp-care-first-screen.mjs', workflowPath]) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}
