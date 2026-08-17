from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one anchor, found {count}')
    return text.replace(old, new, 1)


path = Path('HANDOFF-2026-08-17.md')
text = path.read_text()
text = replace_once(
    text,
    '7 个 reviewed profile / **3 条 reviewed pair rule**；priority cohort 132 个有向组合仍只有 2 个 recordable direction。',
    '7 个 reviewed profile / **4 条 reviewed pair rule**；priority cohort 132 个有向组合仍只有 2 个 recordable direction。',
    'top compatibility count',
)
text = replace_once(
    text,
    'reviewed species profile 保持 7，reviewed pair rule 从 2 增到 3；新增的是有直接 predator–prey 实验证据支持的阻断型 pair，不代表 broad compatibility coverage 已完成。',
    'reviewed species profile 保持 7，reviewed pair rule 已从 2 增到 4；新增的是有直接 predator–prey 实验证据支持的阻断型 pair，不代表 broad compatibility coverage 已完成。',
    'top compatibility claim',
)
heading = '## PUI-BC-023 — Daily Check connected closure / Regression\n'
if text.count(heading) != 1:
    raise SystemExit(f'Batch 3 section heading: expected once, found {text.count(heading)}')
if '### Evidence Batch 3 — Channa argus × Rhodeus ocellatus direct pair' in text:
    raise SystemExit('Batch 3 Handoff section already exists')
section = """### Evidence Batch 3 — Channa argus × Rhodeus ocellatus direct pair — guarded branch PASS

Usage-first selector 先检查当前 PostHog taxonomy：**尚未观察到 `compatibility_pair_evaluated` 事件**。因此当前仍没有可用于 pair-frequency 排序的真实 usage 样本，本批不得把任何 pair 称为“高频用户需求”。Prospective telemetry 已在产品代码中，但事件未进入当前项目 taxonomy 可能意味着已部署版本尚未产生实际 exposure；在真实事件出现前，usage-driven prioritization 仍不可用，telemetry 本身也不计入 knowledge coverage。

按既定 research-only risk fallback 转到 `Channa argus`。研究阶段主动排除 `Carassius auratus` / `Cyprinus carpio` 作为本批落库对象：AquaGuide 对金鱼/锦鲤按多个观赏品系 ID 建模，复制同一 taxon-level evidence 会虚增 pair-rule coverage，只挂到某一品系又会造成任意性。

本批选择 catalog 唯一映射：`sp_0224 / 白金雷龙 / Channa argus` + `sp_0475 / 高体鳑鲏 / Rhodeus ocellatus`。

- 2015 Entropy exact-species predator–prey experiment：prey=`Rhodeus ocellatus`，predator=`Channa argus`；猎物表现出远离捕食者的行为。
- 2026 Comparative Biochemistry and Physiology Part A：将 `Channa argus` 明确描述为 `Rhodeus ocellatus` 的 natural predator，并进行 20-day 持续视觉/化学捕食压力处理。
- verdict=`not_recommended`；riskType=`predation_threat`；basis=`pair_rule`；confidence=`medium`；reviewStatus=`reviewed`。
- 证据边界：两项实验均为物理隔离/非家庭缸长期同缸条件，因此只支持明确 predation threat，不得改写成“已观察到家庭缸内吞食”。

Guard Run **32041864463** 已 PASS：exact-anchor patch / product registry / compatibility evidence regression / compatibility scorecard / TypeScript 全绿，临时 workflow/script 已自删除。

Coverage 边界：reviewed profiles **7 → 7**；reviewed pair rules **3 → 4**；scorecard non-regression floor 提升到 profiles=7 / pairRules=4；priority recordable directions 继续 **2 / 132**，本批阻断型 evidence 不放宽任何未审核 pair。`PUI-BC-025` 继续 **investigating**。

"""
text = text.replace(heading, section + heading, 1)
path.write_text(text)
