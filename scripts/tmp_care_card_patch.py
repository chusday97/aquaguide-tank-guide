from pathlib import Path
import json


def replace_all(path, old, new, expected_min=1):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    assert count >= expected_min, f'{path}: expected >= {expected_min} anchors, got {count}'
    p.write_text(text.replace(old, new))


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    assert count == 1, f'{path}: expected 1 anchor, got {count}'
    p.write_text(text.replace(old, new, 1))

care = 'src/pages/CareEncyclopedia.tsx'
# Keep the pre-existing onOpenShare prop for Collection/backward compatibility.
# Add a separate optional local-card action; only the Care page supplies it.
replace_all(
    care,
    "onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}",
    "onOpenShare={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))}\n              onOpenCareCard={() => setShareTopic(selectedTopic)}",
)
replace_all(care, '  onOpenShare,\n', '  onOpenShare,\n  onOpenCareCard,\n')
replace_all(care, '  onOpenShare: () => void;\n', '  onOpenShare: () => void;\n  onOpenCareCard?: () => void;\n')

anchor = '''          </section>\n\n          {relatedTopics.length > 0 && ('''
insert = '''          </section>\n\n          {onOpenCareCard && (\n            <section data-care-card-utility className="mt-3 rounded-[18px] border border-emerald-100 bg-emerald-50/35 p-3">\n              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">\n                <div className="min-w-0">\n                  <div className="text-[12px] font-black text-ink">{isEn ? 'Take this guide with you' : '带走这份指南'}</div>\n                  <p className="mt-0.5 text-[10px] font-bold leading-relaxed text-ink/45">\n                    {isEn ? 'Generate a local care card you can preview and copy. This does not create a public share link.' : '生成可预览、可复制的本地养护卡；不会创建公开分享链接。'}\n                  </p>\n                </div>\n                <Button\n                  type="button"\n                  variant="outline"\n                  onClick={onOpenCareCard}\n                  className="h-10 shrink-0 rounded-full border-emerald-200 bg-white px-4 text-[12px] font-black text-emerald-800 hover:bg-emerald-50"\n                >\n                  <Copy className="mr-1 h-4 w-4" />\n                  {isEn ? 'Generate Care Card' : '生成养护卡'}\n                </Button>\n              </div>\n            </section>\n          )}\n\n          {relatedTopics.length > 0 && ('''
replace_once(care, anchor, insert)

replace_once(
    'package.json',
    '    "test:product-actions-runtime": "node scripts/verify-action-kind-runtime.mjs",\n',
    '    "test:product-actions-runtime": "node scripts/verify-action-kind-runtime.mjs",\n    "test:care-card-action-ui": "node scripts/verify-care-card-action.mjs",\n',
)

workflow = '.github/workflows/product-golden-path.yml'
replace_once(
    workflow,
    '''      - name: GP-001 first tank setup browser path\n        env:\n          PREVIEW_URL: http://127.0.0.1:4173\n        run: npm run test:golden-path-gp001-ui\n''',
    '''      - name: Care card action regression\n        env:\n          PREVIEW_URL: http://127.0.0.1:4173\n        run: npm run test:care-card-action-ui\n      - name: GP-001 first tank setup browser path\n        env:\n          PREVIEW_URL: http://127.0.0.1:4173\n        run: npm run test:golden-path-gp001-ui\n''',
)

bad = Path('evaluation/product/badcases.v1.jsonl')
bad_text = bad.read_text()
assert '"id":"PUI-BC-032"' not in bad_text
case = {
    'id': 'PUI-BC-032',
    'featureId': 'care',
    'discoveredAt': '2026-08-18',
    'source': 'functional_cta_audit',
    'severity': 'medium',
    'symptom': 'Care 已实现 CareShareCardPreview、养护卡 Dialog 和 copyShareText，但 shareTopic 从未被设置为具体 topic；文章详情没有“生成养护卡”入口，因此真实已有能力对用户完全不可达。',
    'trigger': '打开 /care?topic=guide_safe_water_change 的文章详情，尝试生成可复制的养护卡。',
    'expected': '文章详情提供明确的“生成养护卡”本地工具入口，打开现有预览 Dialog，并允许复制真实养护卡文字；不得把它描述成尚未上线的公开分享链接/隐私能力。',
    'actual': 'Fail-before-fix Run 32051446275 在 build/preview PASS 后得到“生成养护卡”按钮 count=0；代码只有关闭 Dialog 时 setShareTopic(null)，没有任何 setShareTopic(topic) 打开路径，onOpenShare 还被错误耦合到 building sharing preview。',
    'rootCauseLayer': 'ui_action_wiring',
    'status': 'fixed',
    'fixedBy': 'agent/care-card-action-closure',
    'regression': '新增 verify-care-card-action.mjs：文章详情必须有唯一生成养护卡入口；点击打开现有卡片 Dialog；复制文字必须真实写入 clipboard；不得出现公开分享/发布能力。最终 PR head Product Golden Path 后升级 regression_verified。',
}
bad.write_text(bad_text.rstrip() + '\n' + json.dumps(case, ensure_ascii=False, separators=(',', ':')) + '\n')

handoff = Path('HANDOFF-2026-08-17.md')
h = handoff.read_text().rstrip()
assert 'PUI-BC-032' not in h
h += '''\n\n### Functional CTA Audit v3 — Care card action closure\n\nPR #86 `Mark Settings sharing as building instead of live CTA` 已 squash merge 到 main：`daadc2a3647ed394f70a4b8858af3b32cd68ba70`。最终 head `bb010840fa7772f9029eead2f76603b823f10a0e` 的 Product Golden Path **#592 / run `32051036636`** 验证 30 Badcases、typecheck/build、GP-001～GP-005 全 PASS；`PUI-BC-031` 为 `regression_verified`。\n\n继续审计 Care 时发现 `PUI-BC-032`：页面已经存在 `shareTopic` state、`CareShareCardPreview`、`buildCareCardCopyText(...)`、`copyShareText(...)` 与“生成养护卡/复制文字” Dialog，但没有任何用户动作把 `shareTopic` 设为当前 topic；`CareArticleDetail` 的 `onOpenShare` 还被耦合到完整 `sharing` building feature preview。Temporary fail-before-fix Run **`32051446275`** 在 build + preview PASS 后明确失败于“生成养护卡”入口 count **0 != 1**。\n\n修复只开放已经真实存在的窄能力：Care 文章详情新增 **“生成养护卡”** utility，使用独立可选 `onOpenCareCard` 调用 `setShareTopic(selectedTopic)` 打开现有本地预览，并保留真实 `复制文字`；Collection 复用的文章详情未提供该 prop，因此不会错误显示一个仍指向 building sharing preview 的养护卡按钮。文案明确“不会创建公开分享链接”。完整 Sharing & Privacy 继续保持 `building`，没有生成公开链接、权限或发布动作。新增永久 browser regression 并接入 Product Golden Path。`PUI-BC-032` 暂记 `fixed`，待最终 PR head 全绿后升级 `regression_verified`。'''
handoff.write_text(h + '\n')
