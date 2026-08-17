from pathlib import Path
import json

badcase_path=Path('evaluation/product/badcases.v1.jsonl')
text=badcase_path.read_text()
assert '"id":"PUI-BC-030"' not in text
case={'id':'PUI-BC-030','featureId':'collection','discoveredAt':'2026-08-18','source':'functional_cta_audit','severity':'medium','symptom':'水族册首页把明确标记“建设中/暂未开放”的成就模块头部继续渲染成可点击按钮并显示前进箭头，点击后只进入另一个建设中页面；视觉 affordance 暗示存在可完成任务，但没有真实业务结果。','trigger':'进入 /collection，看到“成就勋章 · 建设中”卡片并点击卡片头部。','expected':'building feature 不得伪装成业务 CTA；未开放模块应为非交互信息面，只有“了解功能/返回”等明确元动作可以保持可点击。','actual':'CollectionModuleCard 对 achievements 与 live module 共用 openModule 按钮和 ChevronRight，虽然正文写“暂未开放”，仍把整张入口表现为可执行功能。','rootCauseLayer':'ui_affordance','status':'fixed','fixedBy':'agent/functional-cta-closure-v1','regression':'Collection hub browser regression要求 building achievements 卡显式 data-feature-status=building 且内部 0 button；最终 head CI 通过后再升级 regression_verified。'}
badcase_path.write_text(text.rstrip()+'\n'+json.dumps(case,ensure_ascii=False,separators=(',',':'))+'\n')

handoff=Path('HANDOFF-2026-08-17.md')
text=handoff.read_text().rstrip()
assert 'PUI-BC-030' not in text
text+='''\n\n## 2026-08-18 — Functional CTA Completeness 切换\n\n用户反馈暴露新的验收缺口：现有 action audit 主要证明按钮有 handler / route / view state，5 条 Golden Path 只证明指定主路径闭环，不能证明全站每个可点击 affordance 都有与文案一致的真实业务 effect。项目优先级暂时从 compatibility breadth evidence 切换为 **Action Completeness**。\n\n首个可复现 badcase 为 `PUI-BC-030`：`/collection` 的“成就勋章”明确写着“建设中/暂未开放”，但模块头部仍与 live module 共用可点击 `<button>` + 前进箭头；点击后只进入另一个 building surface。修复原则：building feature 不得伪装成可执行业务 CTA。成就首页卡改为纯信息面，不再可点击；direct `/collection/achievements` 仍可作为深链 disclosure。\n\n`PUI-BC-030` 先记为 `fixed`，等待 collection browser regression 和最终 PR head CI 后再改 `regression_verified`。下一批继续按 **Trigger → Execution → Observable result → Persistence → Failure/Retry** 审计 Aquarium / Care / Identify / Collection / Settings，优先修 PARTIAL/DEAD CTA，不再以“存在 onClick”作为完成。'''
handoff.write_text(text+'\n')
