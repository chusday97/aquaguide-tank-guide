import fs from 'node:fs';

const path = 'evaluation/product/badcases.v1.jsonl';
const raw = fs.readFileSync(path, 'utf8').trim();
const rows = raw.split('\n').map((line, index) => {
  try { return JSON.parse(line); } catch (error) { throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`); }
});

const matches025 = rows.filter(row => row.id === 'PUI-BC-025');
if (matches025.length !== 1) throw new Error(`Expected exactly one PUI-BC-025, found ${matches025.length}`);
if (rows.some(row => row.id === 'PUI-BC-027')) throw new Error('PUI-BC-027 already exists; refusing duplicate append');

const bc025 = matches025[0];
if (bc025.status !== 'investigating') throw new Error(`PUI-BC-025 status drifted to ${bc025.status}`);
bc025.actual = 'Evidence Batch 1 将 reviewed profile 5→7；PR #78 已合并 pair-level usage telemetry 与 research-only fallback。Evidence Batch 2 首个 research group 选择地图鱼 Astronotus ocellatus，并找到其与斑马鱼 Danio rerio 的直接 predator–prey 实验资料；新增 reviewed pair rule 后 profiles 仍为 7、pair rules 2→3，priority common cohort recordable 仍为 2/132，状态仍为 insufficient_data=108 / not_recommended=22 / caution=2。';
bc025.fixedBy = 'agent/compatibility-coverage-scorecard + agent/compatibility-evidence-batch-1 + agent/compatibility-pair-telemetry + agent/compatibility-evidence-batch-2-oscar-zebrafish';
bc025.regression = 'Batch 2 direct-pair gate：地图鱼 sp_0451 + 斑马鱼 sp_0435 = not_recommended；pair evidence basis=pair_rule、reviewed、保留 peer-reviewed citations；priority cohort recordable 仍=2。PUI-BC-025 继续 investigating，新增 1 条阻断型 pair evidence 不代表 broad coverage 已完成。';

rows.push({
  id: 'PUI-BC-027',
  featureId: 'compatibility',
  discoveredAt: '2026-08-17',
  source: 'evidence_provenance_audit',
  severity: 'high',
  symptom: '所有 reviewed pair rule 都被 engine 硬编码追加“根据两种生物各自资料推断，并非直接配对实验”，因此 basis=pair_rule 的直接配对/捕食实验也会被用户界面错误描述成间接推断。',
  trigger: 'Evidence Batch 2 为地图鱼 sp_0451 与斑马鱼 sp_0435 增加 direct predator–prey reviewed pair rule，并通过 authoritative compatibility decision 渲染证据。',
  expected: '证据 provenance 必须按 basis 表达：rule_inference 保留“由两侧资料推断、非直接实验”；pair_rule 明确已有直接配对/捕食风险实验支持，同时说明实验条件不等于家庭水族箱长期同缸。',
  actual: 'species_only 与完整 tank scope 两个分支都对 reviewed pair rule 追加同一固定间接证据 disclaimer，无法表达 direct pair evidence。',
  rootCauseLayer: 'evidence_semantics',
  status: 'investigating',
  fixedBy: 'agent/compatibility-evidence-batch-2-oscar-zebrafish',
  regression: 'Guard run 32037647831 已通过 exact-anchor patch、test:compatibility-evidence-coverage 与 TypeScript：direct Oscar+zebrafish rule 不再出现“并非直接配对实验”，且保留“实验条件不等于家庭水族箱长期同缸”限制；待最终 Product Golden Path 全绿后标 regression_verified。',
});

fs.writeFileSync(path, `${rows.map(row => JSON.stringify(row)).join('\n')}\n`);
console.log('Batch 2 badcases updated: PUI-BC-025 remains investigating; PUI-BC-027 added investigating');
