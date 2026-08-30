import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = process.cwd();
const artifactRoot = resolve(root, '.artifacts/readiness');
const evaluatedAt = new Date().toISOString();

const run = (file, args, options = {}) => {
  const started = Date.now();
  try {
    const output = execFileSync(file, args, {
      cwd: root,
      encoding: 'utf8',
      timeout: options.timeout ?? 120_000,
      env: { ...process.env, ...(options.env ?? {}) },
      maxBuffer: 4 * 1024 * 1024,
    }).trim();
    return { ok: true, output, durationMs: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim() || error.message,
      durationMs: Date.now() - started,
      code: error.status ?? null,
    };
  }
};

const parseJson = (text) => {
  try { return JSON.parse(text); } catch { return null; }
};

const statusFromResult = (result, kind = 'local') => {
  if (result.ok) return 'PASS';
  const text = result.output.toLowerCase();
  if (kind === 'user' && (text.includes('ui freeze failed') || text.includes('visual-owned files changed') || text.includes('baseline'))) return 'USER_ACCEPTANCE_REQUIRED';
  if (text.includes('could not resolve host') || text.includes('network') || text.includes('internet') || text.includes('api.github.com') || text.includes('timed out') || text.includes('rate limit') || text.includes('eperm') || text.includes('operation not permitted') || text.includes('enoent') || text.includes('command not found')) {
    return 'UNVERIFIED';
  }
  return 'FAIL';
};

const stateResult = run('node', ['scripts/project-status.mjs'], { timeout: 20_000, env: { CI: 'true' } });
if (!stateResult.ok) throw new Error(`project:status failed before readiness collection:\n${stateResult.output}`);
const project = parseJson(stateResult.output);
if (!project?.sha) throw new Error('project:status did not return a current SHA.');

const gate = ({ gateId, title, command, expected, source = 'local', kind = 'local', result, notes = null, requiresClean = false }) => ({
  gateId,
  title,
  evaluatedSha: project.sha,
  status: requiresClean && project.dirty ? 'UNVERIFIED' : statusFromResult(result, kind),
  checkedAt: evaluatedAt,
  source,
  command,
  expected,
  actual: result.ok ? result.output.slice(-1200) || 'command passed' : result.output.slice(-1800),
  durationMs: result.durationMs,
  notes: requiresClean && project.dirty
    ? `${notes ? `${notes} ` : ''}工作树存在未提交变更，结果不能绑定到 HEAD SHA；提交后必须重新采集。`
    : notes,
});

const gates = [];
gates.push(gate({
  gateId: 'project-truth',
  title: '项目事实与当前分支一致',
  command: 'node scripts/project-status.mjs',
  expected: '当前分支、候选 SHA、生产指针和 PR 元数据可读取，工作树干净。',
  result: stateResult,
}));
if (project.dirty) gates[0] = {
  ...gates[0],
  status: 'BLOCKED',
  actual: `${gates[0].actual} 工作树存在未提交变更；当前报告只作开发中记录。`,
  notes: '提交并重新采集后，才能生成绑定当前 SHA 的 PASS 证据。',
};
if (project.remoteSha && project.remoteSha !== project.sha) gates[0] = {
  ...gates[0],
  status: 'FAIL',
  actual: `${gates[0].actual} 远端记录为 ${project.remoteSha}，与本地 ${project.sha} 不一致。`,
  notes: '必须推送并重新采集，不能把旧远端结果当作当前 SHA 证据。',
};

const localCommands = [
  ['domain-authority', '混养 Domain 是唯一状态来源', 'npm run test:domain-compatibility', 'Domain 处理环境、行为、空值和安全降级。'],
  ['compatibility-service', 'Service 层不覆盖 Domain 结论', 'npm run test:compatibility-service', 'Service 返回与 Domain 相同的状态、策略和版本。'],
  ['addition-intents', '现实记录与规划加入语义分离', 'npm run test:addition-intents', 'record_existing 可记录，planned_addition 受四级策略约束。'],
  ['presentation', '内部安全状态与用户展示分离', 'npm run test:compatibility-presentation', '有事实显示确认内容，无事实不渲染误导性兼容结论。'],
  ['compatibility-cases', '关键混养案例和安全降级', 'npm run test:mini-compatibility', '未知资料、已审核组合和规则冲突均按契约返回。'],
  ['catalog', 'Catalog Schema、引用和 checksum', 'npm run catalog:validate', '486 个物种快照可解析，引用关系和 checksum 通过。'],
  ['catalog-contract', 'Catalog 发布契约', 'npm run test:catalog-release-contract', '版本、快照、发布状态和不可变约束契约通过。'],
  ['api-types', 'API 类型检查', 'npm run check:api', 'API TypeScript 类型检查通过。'],
  ['lint', 'TypeScript lint', 'npm run lint', '项目类型与 lint 检查通过。'],
  ['build', 'Production build', 'npm run build', '生产构建成功。'],
  ['supabase-db-tests', '本地 Supabase pgTAP', 'supabase test db --local', '本地 migration、RLS 和数据库回归通过。'],
  ['supabase-schema-lint', '本地 Supabase Schema lint', 'supabase db lint --local --schema public --level error --fail-on error', 'Schema lint 无 error。'],
  ['compatibility-authority', '旧引擎不能创建第二套结论', 'npm run check:compatibility-authority', '静态依赖门禁通过。'],
  ['project-truth-contract', 'Canonical 文档与项目状态一致', 'npm run check:project-truth', '项目真相文档、发布状态和分支契约通过。'],
];
for (const [gateId, title, command, expected] of localCommands) {
  const [file, ...args] = command.split(' ');
  const result = run(file, args);
  gates.push(gate({ gateId, title, command, expected, result, requiresClean: true }));
}

const uiFreeze = run('npm', ['run', 'check:ui-freeze']);
gates.push(gate({
  gateId: 'ui-freeze',
  title: '视觉基线与人工验收',
  command: 'npm run check:ui-freeze',
  expected: '当前 UI 已被用户确认，截图/结构基线与候选一致。',
  kind: 'user',
  result: uiFreeze,
  requiresClean: true,
  notes: '当前 4319 视觉差异和乱码仍需用户确认；该状态不会阻止底层进度，但会阻止生产发布。',
}));

let remote = run('git', ['ls-remote', 'origin', `refs/heads/${project.sourceConvergenceBranch ?? 'codex/main-core-foundation-v1'}`], { timeout: 8_000 });
if (remote.ok) {
  const remoteSha = remote.output.split(/\s+/)[0];
  if (remoteSha !== project.sha) remote = { ...remote, ok: false, output: `GitHub returned ${remoteSha || 'no SHA'}, expected ${project.sha}.` };
}
gates.push(gate({
  gateId: 'github-sha',
  title: 'GitHub 候选 SHA 实时同步',
  command: `git ls-remote origin refs/heads/${project.sourceConvergenceBranch ?? 'codex/main-core-foundation-v1'}`,
  expected: `GitHub 候选分支 SHA 等于 ${project.sha}。`,
  source: 'github',
  result: remote,
  notes: remote.ok && !remote.output.startsWith(project.sha) ? '远端返回的 SHA 与本地不同。' : null,
}));

let pr = run('gh', ['pr', 'view', String(project.activePullRequest?.number ?? 142), '--json', 'headRefOid,isDraft,state,baseRefName,headRefName,mergeCommit'], { timeout: 8_000 });
if (pr.ok) {
  const prInfo = parseJson(pr.output);
  const expectedPr = project.activePullRequest ?? {};
  const headMatches = prInfo?.headRefOid === project.sha
    && prInfo.baseRefName === expectedPr.base
    && prInfo.headRefName === expectedPr.head;
  const mergedMatches = prInfo?.state === 'MERGED'
    && Boolean(prInfo.mergeCommit?.oid)
    && prInfo.baseRefName === expectedPr.base
    && run('git', ['merge-base', '--is-ancestor', prInfo.mergeCommit.oid, project.sha], { timeout: 8_000 }).ok;
  const valid = headMatches || mergedMatches;
  if (!valid) pr = { ...pr, ok: false, output: `PR metadata does not match current candidate: ${pr.output}` };
}
gates.push(gate({
  gateId: 'github-pr',
  title: 'PR 状态与候选一致',
  command: `gh pr view ${project.activePullRequest?.number ?? 142} --json headRefOid,isDraft,state,baseRefName,headRefName,mergeCommit`,
  expected: `PR #${project.activePullRequest?.number ?? 142} 未合并时 head 等于当前 SHA；合并后 merge commit 等于当前 SHA。`,
  source: 'github',
  result: pr,
}));

const preview = run('npm', ['run', 'check:preview-parity'], { timeout: 12_000 });
gates.push(gate({
  gateId: 'preview-sha',
  title: 'Preview SHA parity',
  command: 'npm run check:preview-parity',
  expected: '本地、GitHub 候选、PR 和 Preview 使用同一完整 SHA。',
  source: 'preview',
  result: preview,
  notes: '网络或 Vercel 限流时必须显示 UNVERIFIED，不能沿用旧绿色结果。',
}));

const productionFrozen = project.productionDeploymentFrozen === true;
const providerSummary = Object.entries(project.productionProviders ?? {})
  .map(([name, provider]) => `${name}:${provider?.status ?? 'UNVERIFIED'}`)
  .join(', ') || '未配置生产渠道';
gates.push({
  gateId: 'production-freeze',
  title: '生产部署已与 main 解耦',
  evaluatedSha: project.sha,
  status: productionFrozen ? 'PASS' : 'BLOCKED',
  checkedAt: evaluatedAt,
  source: 'production',
  command: '读取 project:status.productionDeploymentFrozen',
  expected: '所有仍在使用的生产渠道不会因 main 更新自动发布；历史渠道不参与冻结计算。',
  actual: productionFrozen ? 'productionDeploymentFrozen=true' : 'productionDeploymentFrozen=false；平台设置尚未读回确认。',
  notes: `生产回退指针：${project.productionPointerSha ?? 'UNVERIFIED'}；渠道：${providerSummary}`,
});

gates.push({
  gateId: 'supabase-production',
  title: 'Supabase 生产 Catalog migration 与权限',
  evaluatedSha: project.sha,
  status: 'UNVERIFIED',
  checkedAt: evaluatedAt,
  source: 'production',
  command: '未执行生产写入；等待独立 migration 授权',
  expected: '第 27 个 migration、RLS、旧 API 和生产 checksum 已真实验证。',
  actual: '生产仍只有前 26 个 migration；未执行生产 SQL。',
});

const counts = Object.fromEntries(['PASS', 'FAIL', 'BLOCKED', 'UNVERIFIED', 'USER_ACCEPTANCE_REQUIRED'].map(status => [status, gates.filter(item => item.status === status).length]));
const localPass = gates.filter(item => ['project-truth', 'domain-authority', 'compatibility-service', 'addition-intents', 'presentation', 'compatibility-cases', 'catalog', 'catalog-contract', 'api-types', 'lint', 'build', 'supabase-db-tests', 'supabase-schema-lint', 'compatibility-authority', 'project-truth-contract'].includes(item.gateId)).every(item => item.status === 'PASS');
const mainConvergence = localPass && gates.find(item => item.gateId === 'production-freeze')?.status === 'PASS' && gates.find(item => item.gateId === 'github-sha')?.status === 'PASS' && gates.find(item => item.gateId === 'github-pr')?.status === 'PASS';
const productionRelease = mainConvergence && gates.every(item => ['PASS'].includes(item.status));

const report = {
  schemaVersion: 1,
  evaluatedAt,
  evaluatedSha: project.sha,
  branch: project.localBranch,
  worktreeClean: project.dirty === false,
  project,
  readiness: {
    mainConvergence: mainConvergence ? 'PASS' : 'BLOCKED',
    productionRelease: productionRelease ? 'PASS' : 'BLOCKED',
  },
  counts,
  gates,
  businessCases: [
    ['freshwater-saltwater', '淡水鱼＋海水鱼', '阻止规划加入'],
    ['unknown-water', '未知水体', '不误判为兼容'],
    ['empty-tank', '空缸无候选', '不生成虚假物种或推荐'],
    ['record-existing', '现实中已有生物', '始终允许记录现实事实'],
    ['wishlist-only', '资料不完整的规划', '只进种草清单，不写鱼缸'],
    ['mini-parrotfish', '迷你鹦鹉鱼 64L 四只幼鱼', '不生成虚假最大数量，保留成体与繁殖风险'],
  ].map(([id, name, expected]) => ({ id, name, expected, status: localPass ? 'PASS' : 'UNVERIFIED', evaluatedSha: project.sha })),
  invalidationRules: [
    { change: 'Domain Rules', invalidates: ['domain-authority', 'compatibility-service', 'compatibility-cases'] },
    { change: 'Catalog 数据', invalidates: ['catalog', 'compatibility-cases'] },
    { change: 'Service/Repository/API', invalidates: ['compatibility-service', 'addition-intents', 'api-types'] },
    { change: 'Supabase migration/RLS', invalidates: ['supabase-production'] },
    { change: 'UI 视觉文件', invalidates: ['ui-freeze', 'preview-sha'] },
  ],
};

const hash = createHash('sha256').update(JSON.stringify(report)).digest('hex').slice(0, 16);
const outputDir = resolve(artifactRoot, project.sha.slice(0, 12));
mkdirSync(outputDir, { recursive: true });
writeFileSync(resolve(outputDir, 'readiness.json'), `${JSON.stringify(report, null, 2)}\n`);

const label = { PASS: '通过', FAIL: '失败', BLOCKED: '阻塞', UNVERIFIED: '未验证', USER_ACCEPTANCE_REQUIRED: '需用户验收' };
const lines = [
  `# AquaGuide 进度证据报告`,
  ``,
  `- 评估 SHA：\`${project.sha}\``,
  `- 分支：\`${project.localBranch}\``,
  `- 评估时间：${evaluatedAt}`,
  `- Main 收敛：**${label[report.readiness.mainConvergence]}**`,
  `- 生产发布：**${label[report.readiness.productionRelease]}**`,
  ``,
  `## 看板`,
  ``,
  ...gates.map(item => `- ${item.title}：**${label[item.status]}**（${item.gateId}）`),
  ``,
  `## 固定业务案例`,
  ``,
  ...report.businessCases.map(item => `- ${item.name}：${item.expected} → **${label[item.status]}**`),
  ``,
  `## 证据新鲜度`,
  ``,
  `本报告只证明 SHA \`${project.sha}\`。分支、Catalog、Domain、Service 或 UI 发生变化后，受影响门禁必须重新采集。`,
  ``,
  `机器报告：\`readiness.json\``,
  `报告指纹：\`${hash}\``,
];
writeFileSync(resolve(outputDir, 'report.md'), `${lines.join('\n')}\n`);
writeFileSync(resolve(artifactRoot, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(resolve(artifactRoot, 'latest.md'), `${lines.join('\n')}\n`);
console.log(JSON.stringify({ outputDir, evaluatedSha: project.sha, readiness: report.readiness, counts, reportHash: hash }, null, 2));
