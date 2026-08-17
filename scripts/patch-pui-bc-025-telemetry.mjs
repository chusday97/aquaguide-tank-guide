import { readFile, writeFile, rm } from 'node:fs/promises';

const path = 'evaluation/product/badcases.v1.jsonl';
const selfPath = 'scripts/patch-pui-bc-025-telemetry.mjs';
const workflowPath = '.github/workflows/pui-bc-025-telemetry-patch.yml';
const source = await readFile(path, 'utf8');
const lines = source.trimEnd().split('\n');
const index = lines.findIndex(line => JSON.parse(line).id === 'PUI-BC-025');
if (index < 0) throw new Error('PUI-BC-025 not found');
const current = JSON.parse(lines[index]);
if (current.status !== 'investigating') throw new Error(`PUI-BC-025 status drifted to ${current.status}; refusing to overwrite`);

lines[index] = JSON.stringify({
  ...current,
  actual: 'Evidence Batch 1 已增加白云金丝 sp_0434 与孔雀鱼 sp_0436 reviewed profile；#531 验证 reviewed profile 5→7、eligible coverage 1.22%→1.70%，recordable 仍为 2/132。Evidence Batch 2 prioritization 审计进一步确认历史 PostHog compatibility 事件没有 species/pair ID，最近 30 天过滤测试账号后仅 compatibility_started=1、compatibility_check_run=7，不能可靠推断高频 pair；PR #78 正在加入 privacy-safe pairKey telemetry 与 research-only fallback queue。',
  fixedBy: 'agent/compatibility-coverage-scorecard + agent/compatibility-evidence-batch-1 + agent/compatibility-pair-telemetry',
  regression: '#531 保持 7 reviewed profiles / recordable=2；PR #78 增加 test:session-events pairKey privacy contract + research-only evidence priority audit + Product Golden Path。PUI-BC-025 继续 investigating；telemetry 不计入 knowledge coverage，只有真实 reviewed evidence 才能提高 coverage。',
});

for (const [lineIndex, line] of lines.entries()) {
  try { JSON.parse(line); } catch (error) { throw new Error(`Invalid JSONL at line ${lineIndex + 1}: ${error}`); }
}
await writeFile(path, `${lines.join('\n')}\n`, 'utf8');
await rm(selfPath);
await rm(workflowPath);
console.log('PUI-BC-025 telemetry prioritization state updated; one-shot tooling removed.');
