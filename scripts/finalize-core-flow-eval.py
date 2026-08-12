from pathlib import Path
import json

# Register permanent browser regression.
package_path = Path('package.json')
package = json.loads(package_path.read_text())
package['scripts']['test:core-flow-state-ui'] = 'node scripts/verify-core-flow-v1-v2-ui.mjs'
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n')

# Add verified badcases only after executable + browser validation has passed.
registry_path = Path('evaluation/product/badcases.v1.jsonl')
rows = [json.loads(line) for line in registry_path.read_text().splitlines() if line.strip()]
by_id = {row['id']: row for row in rows}
new_rows = [
    {
        'id': 'PUI-BC-007', 'featureId': 'compatibility', 'discoveredAt': '2026-08-12', 'source': 'core_flow_audit', 'severity': 'high',
        'symptom': '混养结果中“已经实际入缸，记录下来”调用保存 callback 时没有 catch；持久化失败会变成未处理 Promise，用户没有稳定的失败状态。',
        'trigger': '混养结论允许记录实际入缸，但底层保存 callback 抛错。',
        'expected': '结束 recording 状态，保留候选和数量，显示稳定可重试错误；不得执行假成功反馈。',
        'actual': '旧实现只用 try/finally，没有 catch。', 'rootCauseLayer': 'ui_state', 'status': 'regression_verified',
        'fixedBy': 'agent/core-flow-eval-v1-v2-main', 'regression': 'test:core-flow-state-eval-v1 + test:compatibility + lint + build',
    },
    {
        'id': 'PUI-BC-008', 'featureId': 'add_livestock', 'discoveredAt': '2026-08-12', 'source': 'core_flow_audit', 'severity': 'high',
        'symptom': '批量记录部分失败时，failedItems.message 直接使用 repository error.message，HTTP/API/数据库等内部文本可能进入普通 UI。',
        'trigger': '第一种生物保存成功、第二种保存抛出带技术细节的异常。',
        'expected': '保留部分成功与失败项重试能力，但业务边界只返回稳定用户提示；幂等 operationId 仍保证响应丢失重试不重复加数量。',
        'actual': '旧实现把原始异常文本直接放入 failedItems。', 'rootCauseLayer': 'service_boundary', 'status': 'regression_verified',
        'fixedBy': 'agent/core-flow-eval-v1-v2-main', 'regression': 'test:core-flow-state-eval-v1 + test:livestock-recording',
    },
    {
        'id': 'PUI-BC-009', 'featureId': 'evaluation_system', 'discoveredAt': '2026-08-12', 'source': 'diff_review', 'severity': 'medium',
        'symptom': '旧 core-flow 验证过程中曾在恢复 package.json 时误改无关 dependency 版本，说明评测/修复分支可能引入范围外漂移。',
        'trigger': '合并前比较 feature branch 与 main 的 package/diff。',
        'expected': '评测分支只修改明确目标文件和测试入口；无关依赖版本不得漂移。',
        'actual': '旧 PR 中曾出现 react-i18next 无关版本变化，后被 diff review 拦截。', 'rootCauseLayer': 'development_process', 'status': 'regression_verified',
        'fixedBy': 'agent/core-flow-eval-v1-v2-main', 'regression': 'final compare main...branch + npm ci + lint + build',
    },
    {
        'id': 'PUI-BC-010', 'featureId': 'water_change', 'discoveredAt': '2026-08-12', 'source': 'core_flow_audit', 'severity': 'critical',
        'symptom': '换水日历虽然计算 isFuture，但未来日期按钮没有 disabled，且可以翻到未来月份，未来计划可能被写成已发生历史。',
        'trigger': '打开换水记录并点击未来日期/下个月。',
        'expected': '未来日期不可选、未来月份不可继续导航，并在业务持久化边界再次拒绝未来日期。',
        'actual': '旧 UI 只改变未来日期颜色，没有阻止选择和保存。', 'rootCauseLayer': 'ui_business_boundary', 'status': 'regression_verified',
        'fixedBy': 'agent/core-flow-eval-v1-v2-main', 'regression': 'test:core-flow-state-eval-v2 + test:core-flow-state-ui',
    },
    {
        'id': 'PUI-BC-011', 'featureId': 'water_change', 'discoveredAt': '2026-08-12', 'source': 'core_flow_audit', 'severity': 'high',
        'symptom': '历史换水存在多个状态来源；删除最后一条历史记录时最近换水可能回退成今天，形成并未发生的事实。',
        'trigger': '补录历史换水后再取消最后一条记录。',
        'expected': 'waterChangeHistory 是唯一事实源；最近换水由真实 history 推导并同步到鱼缸和所有缸内生物；空 history 就是未记录。',
        'actual': '旧逻辑存在 history/lastWaterChangeDate 分开维护和 today fallback。', 'rootCauseLayer': 'state_consistency', 'status': 'regression_verified',
        'fixedBy': 'agent/core-flow-eval-v1-v2-main', 'regression': 'test:core-flow-state-eval-v2 + test:core-flow-state-ui',
    },
    {
        'id': 'PUI-BC-012', 'featureId': 'water_change', 'discoveredAt': '2026-08-12', 'source': 'core_flow_audit', 'severity': 'high',
        'symptom': '历史换水补录/取消直接调用同步保存，没有显式 saving/error 状态；存储异常会成为点击错误。',
        'trigger': '选择合法历史日期后，本地持久化失败。',
        'expected': '保留日期选择，显示稳定可重试错误，不显示 raw storage 信息，不伪造成功。',
        'actual': '旧实现没有 UI catch/loading/error。', 'rootCauseLayer': 'ui_state', 'status': 'regression_verified',
        'fixedBy': 'agent/core-flow-eval-v1-v2-main', 'regression': 'test:core-flow-state-eval-v2 + test:core-flow-state-ui',
    },
    {
        'id': 'PUI-BC-013', 'featureId': 'daily_check', 'discoveredAt': '2026-08-12', 'source': 'core_flow_audit', 'severity': 'high',
        'symptom': '每日检查结果保存调用 persistDiagnosisRecords 时没有失败态，主行动会在未持久化时继续执行保存后的后续动作。',
        'trigger': '每日检查已生成结果，但正式记录写入失败。',
        'expected': '保留本次结果与回答，明确未保存、允许重试；只有 persist 成功后才能执行文章/后续主行动。',
        'actual': '旧实现默认保存成功并继续 post-save action。', 'rootCauseLayer': 'ui_persistence_contract', 'status': 'regression_verified',
        'fixedBy': 'agent/core-flow-eval-v1-v2-main', 'regression': 'test:core-flow-state-eval-v2 + test:daily-check + lint + build',
    },
]
for row in new_rows:
    by_id[row['id']] = row
ordered = sorted(by_id.values(), key=lambda row: int(row['id'].split('-')[-1]))
registry_path.write_text('\n'.join(json.dumps(row, ensure_ascii=False, separators=(',', ':')) for row in ordered) + '\n')

# Structural handoff baseline, not a microcopy changelog.
handoff_path = Path('HANDOFF.md')
handoff = handoff_path.read_text()
heading = '## 2026-08-12 Core-flow executable evaluation baseline\n'
if heading not in handoff:
    section = '''## 2026-08-12 Core-flow executable evaluation baseline

- 核心行为不再只做静态“六状态”登记：混养 + 添加生物有 14 个 executable Case，换水 + 每日检查有 12 个 executable Case；四个核心功能都至少覆盖 6 种有业务意义的状态。
- 持久化契约：用户可见层不得展示 repository / storage / HTTP / database 等 raw error；部分成功必须保留已成功事实和失败项重试入口；同一 operationId 的响应丢失重试不得重复增加数量。
- “规划添加”和“现实已在缸内”必须分开：规划冲突可以阻断；现实事实即使高风险也必须允许记录，再明确显示风险，不得为了产品判断删除现实事实。
- 换水记录以 waterChangeHistory 为唯一事实源：最近换水由真实历史推导并同步到鱼缸和所有缸内生物；空历史就是未记录；未来日期不能进入正式历史。
- 每日检查采用同鱼缸、同本地日期 upsert；保存失败必须保留结果并允许重试，保存后的文章/下一步行动只允许在正式记录持久化成功之后执行。
- 永久回归：test:core-flow-state-eval（v1+v2）+ test:core-flow-state-ui + test:compatibility + test:livestock-recording + test:daily-check + lint + build。新增核心行为时，应优先扩展对应 executable Case，而不是只补 happy path。

'''
    marker = '# AquaGuide 交接文档\n\n'
    if marker not in handoff:
        raise SystemExit('HANDOFF header not found')
    handoff = handoff.replace(marker, marker + section, 1)
    handoff_path.write_text(handoff)
