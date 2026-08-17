import fs from 'node:fs';

const badcasePath = 'evaluation/product/badcases.v1.jsonl';
const raw = fs.readFileSync(badcasePath, 'utf8').trim();
const rows = raw.split('\n').map((line, index) => {
  try { return JSON.parse(line); } catch (error) { throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`); }
});
const target = rows.filter(row => row.id === 'PUI-BC-023');
if (target.length !== 1) throw new Error(`Expected exactly one PUI-BC-023, found ${target.length}`);
if (!['open', 'regression_verified'].includes(target[0].status)) throw new Error(`Unexpected PUI-BC-023 status ${target[0].status}`);
Object.assign(target[0], {
  status: 'regression_verified',
  fixedBy: '2add55a54402afc18b642b572d8ee8351ab72c53',
  regression: 'EvalPilot same-case blind-daily-check-risk connected retest Run 32035944562 on AquaGuide 3d73c033b6899e3a92144f6de99a05db8babde78: protocolHealthy=true, Hybrid pass/failureSource=null, semantic pass+complete, 6/6 deterministic assertions PASS. EvalPilot actual promoter regression case case-regression-pui-bc-023 is locked by commit 2d994e22200215c03a14e999d3288c3c41cdc211 and CI Run 32038227247 full PASS. AI-blind evidence only; not a human failure-rate estimate.',
  verification: 'Run 32035944562 entered the real Daily Aquarium Check on the first route, completed and saved the record; provider/evaluator/unknown failures=0, actorOracleLeakCount=0, judgeOracleVisible=true. PUI-BC-024 output guards also remained green.',
});
fs.writeFileSync(badcasePath, `${rows.map(row => JSON.stringify(row)).join('\n')}\n`);

const handoffPath = 'HANDOFF-2026-08-17.md';
let handoff = fs.readFileSync(handoffPath, 'utf8');
const oldTop = `## PUI-BC-023 — Daily Check navigation ambiguity\n\n状态：**open**。\n\n正确入口后的产品闭环已由 GP-003 证明；但 autonomous actor 是否仍会误选 Care Guide Quick Check 尚未真实复跑。当前 GitHub connector 仍没有 workflow dispatch 写接口，没有 connected blind 证据前不得标 \`regression_verified\`。`;
const newTop = `## PUI-BC-023 — Daily Check navigation ambiguity\n\n状态：**regression_verified**。\n\nConnected same-case retest 已闭环：EvalPilot Run \`32035944562\` 在 AquaGuide \`3d73c033b6899e3a92144f6de99a05db8babde78\` 上第一跳进入真实 Daily Aquarium Check，完成并保存当天记录；protocolHealthy=true，Hybrid PASS / failureSource=null，semantic pass+complete，6/6 deterministic assertions PASS。EvalPilot \`case-regression-pui-bc-023\` 已由 commit \`2d994e22200215c03a14e999d3288c3c41cdc211\` 锁定并在 CI Run \`32038227247\` 全绿。证据边界仍是 AI-blind connected evidence，不外推真人失败率。`;
if (handoff.includes(oldTop)) {
  handoff = handoff.replace(oldTop, newTop);
} else if (!handoff.includes('## PUI-BC-023 — Daily Check navigation ambiguity\n\n状态：**regression_verified**。')) {
  throw new Error('PUI-BC-023 top Handoff block drifted unexpectedly');
}

const closureHeading = '## PUI-BC-023 — Daily Check connected closure / Regression';
if (!handoff.includes(closureHeading)) {
  const anchor = '## PUI-BC-026 — Sparse species profile incorrectly clears pair evidence';
  if (!handoff.includes(anchor)) throw new Error('PUI-BC-026 anchor missing');
  const closure = `## PUI-BC-023 — Daily Check connected closure / Regression\n\n- Connected retest：EvalPilot Run **32035944562**，target AquaGuide **3d73c033b6899e3a92144f6de99a05db8babde78**。\n- 同一 EvalCase：\`blind-daily-check-risk\`。\n- 协议：\`protocolHealthy=true\`；Actor Oracle leak=0；Judge Oracle visible=true；provider/evaluator/unknown failures=0。\n- 产品：Hybrid **PASS**，\`failureSource=null\`；semantic Judge **pass + complete**（0.95）；6/6 deterministic assertions PASS。\n- Blind Actor 第一跳直接进入真实 Daily Aquarium Check，完成 6 项观察并保存当天记录，不再误入 Care Guide / Quick Check。\n- PUI-BC-024 的端到端保护同时通过：正确 breathing-only summary；错误“水体异常” summary 与 20%-30% 换水动作均未出现。\n- EvalPilot commit **2d994e22200215c03a14e999d3288c3c41cdc211** 已通过 actual \`promoteFixedBadcaseToRegression()\` 生成稳定 Regression **case-regression-pui-bc-023**；CI Run **32038227247** 全绿。\n- Issue #66 已按 connected same-case PASS 证据关闭为 completed。\n- 边界：这是 AI-blind connected evidence，不外推真人失败率。\n\n`;
  handoff = handoff.replace(anchor, closure + anchor);
}

handoff = handoff.replace(
  '7. `PUI-BC-023` 继续等待真实 connected blind rerun；没有 workflow dispatch 能力时不伪造证据。',
  '7. `PUI-BC-023` 已进入 Regression maintenance；不再重复跑同一 baseline，后续只在行为/导航相关改动时做 targeted regression。',
);
fs.writeFileSync(handoffPath, handoff);
console.log('Synced latest-main PUI-BC-023 closure into Batch 2 branch without changing compatibility verdicts');
