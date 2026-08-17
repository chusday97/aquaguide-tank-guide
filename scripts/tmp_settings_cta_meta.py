from pathlib import Path
import json

bad=Path('evaluation/product/badcases.v1.jsonl')
text=bad.read_text()
assert '"id":"PUI-BC-031"' not in text
case={'id':'PUI-BC-031','featureId':'task_entry_navigation','discoveredAt':'2026-08-18','source':'functional_cta_audit','severity':'medium','symptom':'设置页把明确尚未开放的“分享与隐私”与通用/新手引导/意见反馈并列渲染成普通可点击分类，并显示前进箭头；点击只滚到“功能建设中”说明，没有可完成的分享或隐私任务。','trigger':'桌面进入 /settings，点击左侧“分享与隐私”。','expected':'building feature 不应伪装成 live task navigation；导航层直接标记建设中并取消业务 CTA affordance，说明区只保留“了解功能”等明确元动作。','actual':'旧导航使用与 live settings section 相同的 button + ChevronRight，并调用 focusSection(shared-reports)，视觉上承诺可进入设置任务但实际只有建设中说明。','rootCauseLayer':'ui_affordance','status':'fixed','fixedBy':'agent/functional-cta-audit-v2','regression':'runtime action audit 要求 building surface 内无未声明业务按钮；Settings 分享与隐私导航必须为非 button building row，说明区 Learn action 必须显式 data-building-action=learn。最终 head CI 后升级 regression_verified。'}
bad.write_text(text.rstrip()+'\n'+json.dumps(case,ensure_ascii=False,separators=(',',':'))+'\n')

hand=Path('HANDOFF-2026-08-17.md')
h=hand.read_text().rstrip()
assert 'PUI-BC-031' not in h
h+='''\n\n### Functional CTA Audit v2\n\nPR #85 已 squash merge 到 main：`5bf9800c5554b476bf7e8441560d8744eaefa9b8`。最终 head `fc9c44e2bcf5e37c2b22783ceb21bef97fb63743` 的 Product Golden Path **#587 / run `32048161702`** 全 PASS，`PUI-BC-030` 保持 `regression_verified`。\n\n随后用 temporary CTA effect discovery Run `32049127307` 对 Aquarium / Care / Collection / Identify / Settings / Encyclopedia 首屏 **195 个可见、非破坏性内容按钮**逐个隔离点击。通用 no-effect 候选只有 6 个：Identify 图片入口属于系统 file chooser；Settings 4 个 section navigation 实际调用 `scrollIntoView + focus`，审计未记录嵌套 workspace scroll/focus；当前“简体中文”是已选 radio，再点击无变化属于合法 selected-state 行为。因此本轮没有把这些误报登记为 dead CTA。\n\n但 promise-level 审核发现 `PUI-BC-031`：Settings 的“分享与隐私”本身是 `building`，左侧导航却仍与 live setting 共用普通 button + ChevronRight，点击后只落到“功能建设中”说明。修复为非交互 building row + 显式“建设中”，去掉前进箭头；`#shared-reports` 标记 `data-feature-status=building`，仅“了解功能”保留为 `data-building-action=learn` 元动作。`PUI-BC-031` 先记 `fixed`，待 runtime + final Product Golden Path 后再升级。'''
hand.write_text(h+'\n')
