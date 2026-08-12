import fs from 'node:fs';

const encyclopediaPath = 'src/pages/Encyclopedia.tsx';
const badcasesPath = 'evaluation/product/badcases.v1.jsonl';

const source = fs.readFileSync(encyclopediaPath, 'utf8');
const before = `      closingDetailRef.current = true;\n      detailNavigationContextRef.current = null;\n      if (params.get('source') === 'search') navigate(-1);`;
const after = `      closingDetailRef.current = true;\n      detailNavigationContextRef.current = null;\n      if (!restoreReturnContext) return;\n      if (params.get('source') === 'search') navigate(-1);`;

if (!source.includes(before) && !source.includes(after)) {
  throw new Error('GP-002 patch anchor not found; refusing a fuzzy edit.');
}
if (source.includes(before)) {
  const occurrences = source.split(before).length - 1;
  if (occurrences !== 1) throw new Error(`Expected exactly one GP-002 patch anchor, found ${occurrences}.`);
  fs.writeFileSync(encyclopediaPath, source.replace(before, after));
}

const badcaseId = 'PUI-BC-020';
let badcases = fs.readFileSync(badcasesPath, 'utf8').trimEnd();
if (!badcases.includes(`\"id\":\"${badcaseId}\"`)) {
  const record = {
    id: badcaseId,
    featureId: 'task_entry_navigation',
    discoveredAt: '2026-08-13',
    source: 'golden_path_e2e',
    severity: 'high',
    symptom: '从搜索 deep-link 打开物种详情后，详情主 CTA 尝试进入混养任务时，closeAtlasDetail(false) 仍执行返回/首页导航，与后续 mode=compatibility 导航竞争，导致完整混养 Drawer 可能不出现。',
    trigger: '搜索具体物种 → 打开 species deep-link 详情 → 点击风险/混养主 CTA。',
    expected: '任务型 CTA 关闭详情时不恢复旧浏览上下文，由 CTA 自己唯一决定下一跳；随后进入 /encyclopedia?mode=compatibility 并保留候选物种。',
    actual: 'closeAtlasDetail(false) 在 URL 含 species 时忽略 false，仍 navigate(-1) 或 navigateToRoute(/encyclopedia)，产生竞争导航。',
    rootCauseLayer: 'ui_navigation',
    status: 'fixed',
    regression: 'verify-golden-path-species-to-stocking.mjs + test:task-entry + Golden Path GP-002'
  };
  badcases += `\n${JSON.stringify(record)}\n`;
  fs.writeFileSync(badcasesPath, badcases);
}

console.log('Applied GP-002 deep-link task-transition fix and registered PUI-BC-020.');
