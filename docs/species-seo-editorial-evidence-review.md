# Species SEO 编辑证据候选确认包

状态：13 条已完成项目负责人确认；本文件记录本地证据绑定，不等于解除索引或生产发布。

## 确认方法

项目负责人确认：页面表达没有超出来源支持范围、中文语气准确并可进入用户端。Codex 负责来源映射与 fingerprint；专业来源负责自然史事实，AquaGuide 负责 Product Truth 和归组。确认不等于允许索引，页面仍受 noindex 与独立审查门禁约束。

## 来源登记

| 来源 ID | 来源 | 定位 | 用途 |
| --- | --- | --- | --- |
| `uf-ifas-neocaridina-davidi-2025` | [UF/IFAS Cherry Shrimp profile](https://ask.ifas.ufl.edu/publication/IN1301/pdf) | Introduction；Distribution；Description and Life Cycle；Behavior | 支持淡水身份、台湾淡水溪流、黄色 morph、取食与蜕壳/行为候选 |
| `usgs-nas-neocaridina-davidi-2026` | [USGS NAS Species Profile](https://nas.er.usgs.gov/queries/FactSheet.aspx?speciesID=2257) | Ecology；引用的生态资料 | 支持多环境占据与机会性杂食候选 |
| `frontiers-neocaridina-davidi-noise-2023` | [Frontiers in Ecology and Evolution study](https://doi.org/10.3389/fevo.2023.1091314) | Abstract；Introduction；受控实验部分 | 仅作为行为/取食研究背景登记，当前不生成页面候选结论 |
| `fishData.ts:sp_0001` | AquaGuide Product Truth catalog | `sp_0001` record | 仅支持极火虾名称、学名、分类和参数，不支持外部习性结论 |
| `fishData.ts:sp_0030` | AquaGuide Product Truth catalog | `sp_0030` record | 仅支持黄金米虾名称、学名、分类和参数，不支持外部习性结论 |
| `source-row-map:base_0147_neocaridina_davidi` | AquaGuide source-row map | `base_0147_neocaridina_davidi`; `morph_0162`; `morph_0164` | 仅支持极火虾与黄金米虾同属 `Neocaridina davidi` Base 的项目归组关系 |
| `fishbase-paracheirodon-axelrodi-2026` | [FishBase Paracheirodon axelrodi summary](https://www.fishbase.se/summary/Paracheirodon-axelrodi.html) | Environment；Biology | 支持宝莲灯为淡水鱼、主要在中层水域成群活动，以及取食蠕虫和小型甲壳类的物种资料记录 |

## 页面表达 → 来源 → fingerprint → 状态

以下 fingerprint 由本地确定性函数生成；来源或表达改变时，confirmed 记录会变为 `stale`，来源缺失/失去资格时变为 `blocked`。

| ID | 对象 / 字段 | 页面表达（已确认） | 来源 ID | Fingerprint | 状态 |
| --- | --- | --- | --- | --- | --- |
| `sp_0001:editorial.signature:001` | 极火虾 / signature | 极火虾是 Neocaridina davidi 的红色选育型；其基础物种是原生于台湾淡水溪流的小型淡水观赏虾。 | `fishData.ts:sp_0001`, `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:b68b10ff` | `confirmed` |
| `sp_0001:editorial.overview:001` | 极火虾 / overview | 它常在底部叶屑等表面刮食生物膜，也会取食藻类和有机碎屑。 | `usgs-nas-neocaridina-davidi-2026`, `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:8a6ec6c4` | `confirmed` |
| `sp_0001:editorial.behavior:001` | 极火虾 / behavior | 它大部分时间会在叶屑表面的生物膜上刮食。 | `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:ec0e8060` | `confirmed` |
| `sp_0001:editorial.habitat:001` | 极火虾 / habitat | 其基础物种原生于淡水溪流，也能占据流速不同的多种淡水环境。 | `usgs-nas-neocaridina-davidi-2026`, `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:4c68ff10` | `confirmed` |
| `sp_0001:editorial.feeding:001` | 极火虾 / feeding | 它属于碎屑食性、机会性取食者，会取食藻类、生物膜，以及底部的动植物残体。 | `usgs-nas-neocaridina-davidi-2026`, `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:1463053c` | `confirmed` |
| `sp_0001:faq:001` | FAQ | 问：极火虾属于淡水虾吗？答：是。极火虾所属的 Neocaridina davidi 是淡水观赏虾。 | `fishData.ts:sp_0001`, `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:8b0ec89b` | `confirmed` |
| `sp_0001:faq:002` | FAQ | 问：极火虾主要吃什么？答：现有物种资料记录其会取食藻类、生物膜、叶屑和有机碎屑。 | `usgs-nas-neocaridina-davidi-2026`, `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:7c580499` | `confirmed` |
| `sp_0001:faq:003` | FAQ | 问：极火虾会蜕壳吗？答：会。Neocaridina davidi 通过蜕去外骨骼生长。 | `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:bfdc1d25` | `confirmed` |
| `sp_0030:variantDifference:001` | 黄金米虾 / variantDifference | 黄金米虾是 Neocaridina davidi 的黄色选育型；目前确认的品系差异是黄色外观。 | `fishData.ts:sp_0030`, `source-row-map:base_0147_neocaridina_davidi`, `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:531b0082` | `confirmed` |
| `sp_0001:life.activity:001` | 极火虾 / 它如何生活 · 活动位置 | 它主要在水底的叶屑等表面活动。 | `uf-ifas-neocaridina-davidi-2025` | `fnv1a32:517a40c0` | `confirmed` |
| `sp_0432:life.activity:001` | 宝莲灯 / 它如何生活 · 活动位置 | 宝莲灯主要在水体中层活动。 | `fishbase-paracheirodon-axelrodi-2026` | `fnv1a32:83989e64` | `confirmed` |
| `sp_0432:editorial.habitat:001` | 宝莲灯 / 适合怎样的环境 | 宝莲灯是淡水鱼，原产于奥里诺科和内格罗河上游流域。 | `fishbase-paracheirodon-axelrodi-2026` | `fnv1a32:cc223f22` | `confirmed` |
| `sp_0432:life.foraging:001` | 宝莲灯 / 它如何生活 · 寻找食物 | 宝莲灯会取食蠕虫和小型甲壳类。 | `fishbase-paracheirodon-axelrodi-2026` | `fnv1a32:499bf9b2` | `confirmed` |

## 明确缺口

- 极火虾日常维护：当前来源不足以形成物种专属操作结论，保持省略。
- 黄金米虾差异：黄色外观已完成项目负责人确认，可作为 Variant 差异显示；不复制 Base 正文。
- 宝莲灯：活动水层、淡水流域环境和觅食表达已由项目负责人确认；自然志总览、维护等没有单独确认的章节继续省略。
- 极火虾没有直接证据支持独处/成群倾向，因此不生成社交方式候选；其活动位置候选仍待确认。
- 宝莲灯新增的活动位置、环境和觅食表达均为候选，尚未进入公开聚合。
- 英文、Guide 动作、未审核 FAQ：继续 Draft/缺失，不生成结构化数据。

## 记录

- 候选建立日期：2026-09-02
- 来源核对与表达修订：Codex（UF/IFAS、FishBase、USGS 与 AquaGuide 本地数据对照）
- 人工确认人：`project-owner`
- 确认日期：2026-09-02（新增 4 条行为/环境表达）
