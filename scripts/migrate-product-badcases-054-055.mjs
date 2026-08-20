import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const featurePath = 'evaluation/product/feature-states.v1.json';
const badcasePath = 'evaluation/product/badcases.v1.jsonl';

const featureText = readFileSync(featurePath, 'utf8');
const featureMatrix = JSON.parse(featureText);
const badcaseText = readFileSync(badcasePath, 'utf8');
const badcases = badcaseText.trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));

const shareFeature = featureMatrix.features.find((feature) => feature.id === 'share_report');
const badcase54 = badcases.find((entry) => entry.id === 'PUI-BC-054');
const badcase55 = badcases.find((entry) => entry.id === 'PUI-BC-055');

const validateAppliedState = () => {
  assert.ok(shareFeature, 'share_report feature contract is required once the migration is applied');
  assert.equal(shareFeature.states.length, 6, 'share_report must keep exactly six baseline states in this migration');
  assert.deepEqual(
    shareFeature.states.map((state) => state.id),
    ['initial', 'in_progress', 'success', 'dependency_missing', 'access_boundary', 'deployment_boundary'],
    'share_report state ids drifted from the approved baseline',
  );
  assert.equal(badcase54?.featureId, 'tank_copilot', 'PUI-BC-054 must remain bound to tank_copilot');
  assert.equal(badcase55?.featureId, 'share_report', 'PUI-BC-055 must remain bound to share_report');
};

const appliedCount = Number(Boolean(shareFeature)) + Number(Boolean(badcase54)) + Number(Boolean(badcase55));
if (appliedCount === 3) {
  validateAppliedState();
  console.log('Product badcase 054/055 migration already applied; no changes needed.');
  process.exit(0);
}
if (appliedCount !== 0) {
  throw new Error(`Refusing partial product-evaluation migration: share_report=${Boolean(shareFeature)} bc054=${Boolean(badcase54)} bc055=${Boolean(badcase55)}`);
}

assert.ok(featureText.includes('"id": "livestock_state_task"'), 'expected feature-state tail anchor is missing');
assert.ok(featureText.includes('"updatedAt": "2026-08-13"'), 'feature-state updatedAt anchor drifted; inspect before migrating');
assert.equal(badcases.at(-1)?.id, 'PUI-BC-052', 'badcase registry tail must still be PUI-BC-052 before append');

const shareFeatureBlock = `    {
      "id": "share_report",
      "name": "鱼缸报告分享",
      "states": [
        {"id":"initial","scenario":"已登录用户从真实鱼缸发起分享报告","expected":"只基于当前鱼缸事实生成经过字段白名单清洗的报告快照","forbidden":"把 ownerId、内部记录 ID、用户自由文本或 AI 原始响应直接放入公开报告"},
        {"id":"in_progress","scenario":"正在生成、签名并持久化分享报告","expected":"使用独立签名 secret、管理员数据边界和稳定幂等写入，界面保持生成中状态","forbidden":"暴露 service-role、签名 secret、token hash、数据库错误或产生重复报告副作用"},
        {"id":"success","scenario":"分享报告生成成功且依赖配置完整","expected":"返回基于 WEB_BASE_URL 的规范公开链接、受限有效期和已清洗报告内容","forbidden":"生产环境回退到 localhost、请求 Origin 或不受控的任意域名作为正式分享链接"},
        {"id":"dependency_missing","scenario":"数据库、service-role、SHARE_TOKEN_SECRET 或 WEB_BASE_URL 任一缺失","expected":"能力 readiness=false，并在需要该能力时 fail closed，不伪装分享成功","forbidden":"复用 SUPABASE_SERVICE_ROLE_KEY 充当签名 secret，或只因数据库可用就宣称分享能力就绪"},
        {"id":"access_boundary","scenario":"匿名访问公开分享 token","expected":"只在 token 有效且未过期时返回 sanitized report，不暴露所有者或内部基础设施字段","forbidden":"允许无效/过期 token 读取报告，或返回 ownerId、service credentials、internalId 等内部信息"},
        {"id":"deployment_boundary","scenario":"RC1 发布验收和部署后健康检查","expected":"release contract 必须覆盖 share-report security；post-deploy smoke 必须看到 shareReportsConfigured=true","forbidden":"源码测试通过但真实部署缺 secret/WEB_BASE_URL 时仍把 release 标记为 ready"}
      ]
    }`;

let nextFeatureText = featureText.replace('"updatedAt": "2026-08-13"', '"updatedAt": "2026-08-20"');
const tailAnchor = '\n    }\n  ]\n}\n';
assert.ok(nextFeatureText.endsWith(tailAnchor), 'feature-state closing anchor drifted; refusing broad rewrite');
nextFeatureText = `${nextFeatureText.slice(0, -tailAnchor.length)}\n    },\n${shareFeatureBlock}\n  ]\n}\n`;

const entries = [
  {
    id: 'PUI-BC-054',
    featureId: 'tank_copilot',
    discoveredAt: '2026-08-20',
    source: 'result_ux_fail_before',
    severity: 'high',
    symptom: 'Aquarium visibly exposed the AI Tank Copilot quick action, but clicking it only dispatched feature-preview and could not open the already-implemented live Copilot dialog.',
    trigger: 'Open Aquarium and click the visible AI 建缸助手 / AI Tank Copilot quick action.',
    expected: 'The advertised live entry opens the real Copilot task surface; generated model context remains subordinate to deterministic local safety rules.',
    actual: 'The entry dispatched aquaguide:feature-preview instead of setting the existing Copilot open state, so the real feature was unreachable.',
    rootCauseLayer: 'feature_entry_wiring',
    status: 'regression_verified',
    fixedBy: '582e9e341b0231ae30c6d37fa6536ef0d0498de7',
    regression: 'Fail-before Result UX 32358918838 isolated live-entry reachability after static/deterministic/type/build/six prior consumers passed. Final clean Result UX 32359908856 passed all seven consumers including Tank Copilot entry + AI-authority regression.',
  },
  {
    id: 'PUI-BC-055',
    featureId: 'share_report',
    discoveredAt: '2026-08-20',
    source: 'production_readiness_audit',
    severity: 'high',
    symptom: 'Share-report signing reused the Supabase service-role credential as an implicit HMAC fallback, while release and post-deploy checks could not prove that dedicated signing, admin database access, and canonical public-link configuration were ready.',
    trigger: 'Audit production configuration and release gates for share-report generation, then simulate missing dedicated share-report dependencies.',
    expected: 'A dedicated SHARE_TOKEN_SECRET is mandatory; release acceptance covers the contract; deployed health exposes only boolean readiness and requires database + service-role + dedicated secret + WEB_BASE_URL.',
    actual: 'Old config silently fell back to SUPABASE_SERVICE_ROLE_KEY, RC1 Release Acceptance omitted the share-report contract, business-health only reported general database readiness, and post-deploy smoke could not detect missing share-report dependencies.',
    rootCauseLayer: 'secret_boundary_release_readiness',
    status: 'regression_verified',
    fixedBy: '173530bdc5ea34abcea65d00700b145fc7cf88db + 8f9bccf3dc7ba85688c9d727dc551cd3898b60d6 + 6f4f402414d36296a17b3087ed8ce4e550ba5208 + 1da62bb1ce11098ce38a489e6a7b95bc40995178',
    regression: 'Fail-before Security runs 32363518780, 32364388187, 32364742513, 32365165728 isolated secret reuse, release-gate omission, missing readiness signal, and missing WEB_BASE_URL respectively. Final same-head Security 32365318251 plus Result UX 32365318222, Plant 32365318305, and Stage Risk 32365318290 all PASS.',
  },
];

const separator = badcaseText.endsWith('\n') ? '' : '\n';
const nextBadcaseText = `${badcaseText}${separator}${entries.map((entry) => JSON.stringify(entry)).join('\n')}\n`;

writeFileSync(featurePath, nextFeatureText);
writeFileSync(badcasePath, nextBadcaseText);

const verifyFeatureMatrix = JSON.parse(readFileSync(featurePath, 'utf8'));
const verifyBadcases = readFileSync(badcasePath, 'utf8').trim().split(/\r?\n/).map((line) => JSON.parse(line));
assert.ok(verifyFeatureMatrix.features.some((feature) => feature.id === 'share_report'), 'share_report feature insertion failed');
assert.equal(verifyBadcases.at(-2)?.id, 'PUI-BC-054');
assert.equal(verifyBadcases.at(-1)?.id, 'PUI-BC-055');
console.log('Applied append-only product badcase migration for PUI-BC-054/PUI-BC-055.');
