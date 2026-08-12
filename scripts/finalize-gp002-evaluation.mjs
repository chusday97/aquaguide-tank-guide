import fs from 'node:fs';

const pkgPath = 'package.json';
const goldenPath = 'evaluation/product/golden-path-v1.json';
const badcasesPath = 'evaluation/product/badcases.v1.jsonl';
const readmePath = 'evaluation/product/README.md';
const handoffPath = 'HANDOFF.md';

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts['test:golden-path-contract'] = 'node scripts/test-golden-path-acceptance.mjs';
pkg.scripts['test:compatibility-evidence-coverage'] = 'tsx scripts/test-compatibility-evidence-coverage.ts';
pkg.scripts['test:golden-path-gp002-ui'] = 'node scripts/verify-golden-path-species-to-stocking.mjs';
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
golden.updatedAt = '2026-08-13';
const gp002 = golden.paths.find(path => path.id === 'GP-002');
if (!gp002) throw new Error('GP-002 missing from Golden Path registry.');
for (const command of ['test:golden-path-gp002-ui', 'test:compatibility-evidence-coverage']) {
  if (!gp002.existingAutomation.includes(command)) gp002.existingAutomation.push(command);
}
gp002.coverage = 'covered';
fs.writeFileSync(goldenPath, `${JSON.stringify(golden, null, 2)}\n`);

const badcaseLines = fs.readFileSync(badcasesPath, 'utf8').trimEnd().split('\n').map(line => JSON.parse(line));
const verification = {
  'PUI-BC-020': {
    fixedBy: '4cac7690e1dde0e3f330a3023ae6d481cc597152',
    verification: 'GP-002 continuous Chromium path reaches compatibility from a search species deep-link without return-navigation race.',
  },
  'PUI-BC-021': {
    fixedBy: 'c05949936b29623fcbe57d932701e78bde874b27 + 0ce0cb0c087979503474921a9f88e80b86c476bf',
    verification: 'Real common-species matrix now has an evidence-backed caution path; unreviewed combinations remain insufficient_data instead of being promoted to safe.',
  },
  'PUI-BC-022': {
    fixedBy: '0ce0cb0c087979503474921a9f88e80b86c476bf',
    verification: 'Prey-wording regression passes and 红绿灯 → 宝莲灯 no longer produces predation_risk in the production rule matrix.',
  },
};
for (const item of badcaseLines) {
  if (!verification[item.id]) continue;
  item.status = 'regression_verified';
  item.fixedBy = verification[item.id].fixedBy;
  item.verification = verification[item.id].verification;
}
fs.writeFileSync(badcasesPath, `${badcaseLines.map(item => JSON.stringify(item)).join('\n')}\n`);

let readme = fs.readFileSync(readmePath, 'utf8');
const evalAnchor = '- `scripts/test-golden-path-acceptance.mjs`：校验 Golden Path 里程碑、禁止项与自动化证据映射。';
const evalReplacement = `${evalAnchor}\n- \`scripts/test-compatibility-evidence-coverage.ts\`：用真实图鉴物种验证“可记录组合必须有 reviewed evidence”，并防止和平小型鱼被误判成捕食者。\n- \`scripts/verify-golden-path-species-to-stocking.mjs\`：GP-002 连续 Chromium 验收，从搜索具体物种一直验证到真实入缸后的持久化数量。`;
if (readme.includes(evalAnchor) && !readme.includes('scripts/test-compatibility-evidence-coverage.ts')) readme = readme.replace(evalAnchor, evalReplacement);
const coverageAnchor = '**多个单点测试全部通过，不等于 Golden Path 已 covered。** 只有连续旅程的缺口真正补齐后，才允许升级 coverage。';
const coverageReplacement = `${coverageAnchor}\n\n当前 GP-002 已有连续浏览器证据：搜索宝莲灯 → 打开精确物种详情 → 从主 CTA 进入混养 → 候选数量调至群游要求 ×6 → 查看 caution 结论 → 显式确认风险 → 记录实际入缸 → 读取持久化状态确认宝莲灯 ×6、原有红绿灯数量不变。对应门禁为 \`test:golden-path-gp002-ui\`。兼容性知识覆盖另由 \`test:compatibility-evidence-coverage\` 约束：未知组合继续保持 insufficient_data，不得为了让 Golden Path 通过而放宽安全规则。`;
if (readme.includes(coverageAnchor) && !readme.includes('当前 GP-002 已有连续浏览器证据')) readme = readme.replace(coverageAnchor, coverageReplacement);
fs.writeFileSync(readmePath, readme);

let handoff = fs.readFileSync(handoffPath, 'utf8');
const handoffSection = `## 2026-08-13 Golden Path GP-002 + Compatibility Evidence baseline\n\n- GP-002 已升级为 covered：真实 Chromium 连续执行“搜索宝莲灯 → 精确物种详情 → 主 CTA 进入混养 → 候选 ×6 → caution 风险确认 → 实际入缸 → 持久化数量验证”，不得用多个单点测试替代。\n- Species deep-link 详情进入下一任务时，\`closeAtlasDetail(false)\` 只关闭详情/清理 detail state，不得恢复旧浏览上下文；下一任务 CTA 是唯一导航所有者，避免 return navigation 与 task navigation 竞争。\n- 捕食硬阻断不得从 description / diet / housingReason / feeding notes 等自由文本中的“被捕食、避免大型鱼”等字样反推 predator 身份。Predator identity 只读取结构化 Aggressive/Large 及名称/类别中的明确掠食身份。\n- Compatibility evidence 继续 fail closed：没有 reviewed behavior profile 的组合保持 insufficient_data。红绿灯（sp_0431）与宝莲灯（sp_0432）新增 reviewed species profile；pair 只标 caution，因为当前证据支持群游属性与水质区间重叠，但不是直接配对实验。\n- 永久回归：\`test:golden-path-contract\` + \`test:compatibility-evidence-coverage\` + \`test:golden-path-gp002-ui\` + \`test:core-flow-state-eval\` + \`test:task-entry\` + lint + build。\n\n`;
if (!handoff.includes('## 2026-08-13 Golden Path GP-002 + Compatibility Evidence baseline')) {
  handoff = handoff.replace('# AquaGuide 交接文档\n\n', `# AquaGuide 交接文档\n\n${handoffSection}`);
}
fs.writeFileSync(handoffPath, handoff);

if (fs.existsSync('scripts/diagnose-gp002-safe-fixture.ts')) fs.rmSync('scripts/diagnose-gp002-safe-fixture.ts');
if (fs.existsSync('scripts/finalize-gp002-evaluation.mjs')) fs.rmSync('scripts/finalize-gp002-evaluation.mjs');

console.log('Finalized GP-002 ordinary evaluation files; workflow files are managed separately by GitHub connector permissions.');
