# Species SEO 试点内容与素材矩阵

## 使用范围

本矩阵只覆盖首个用户端试点：`Neocaridina davidi`、极火虾 `sp_0001`、黄金米虾 `sp_0030`。它是内容审核工作表，不是用户页面；没有审核证据的字段保持缺失。

## 当前状态

| 对象 | 层级 | Hero 素材 | Variant 卡片素材 | 中文 Alt | English Alt | Editorial / FAQ | 索引策略 |
|---|---|---|---|---|---|---|---|
| `Neocaridina davidi` / 极火虾 | Base | `sp_0001.png`；`approved`；透明 RGBA；`contain` | `sp_0001.png`；`approved`；稳定比例；`contain` | 已确认：侧视的红色极火虾。 | Draft: Fire shrimp, Neocaridina davidi var. Red | intro/care/FAQ unavailable | noindex |
| 黄金米虾 `sp_0030` | Variant | `sp_0030.png`；`approved`；透明 RGBA；`contain` | `sp_0030.png`；`approved`；稳定比例；`contain` | 已确认：侧视的黄色黄金米虾。 | Draft: Yellow shrimp, Neocaridina davidi var. Yellow | difference/FAQ unavailable | noindex / canonical to Base 待审核 |
| `sp_0027` | Duplicate | 不进入公开 Variant | 不生成 | 不生成 | 不生成 | 不生成 | noindex |

## 字段职责

| 字段组 | 所属 | 来源 | 当前公开状态 | 审核要求 |
|---|---|---|---|---|
| 中文名、学名、分类、难度、水温、pH、最低缸体、体型、换水周期、混养倾向 | Product Truth | `src/data/fishData.ts` 与现有分类/规则服务 | 预览可读，页面不允许编辑 | 与图鉴和规则引擎逐字段比对 |
| Hero/Variant 图片 | Asset | `public/species-image-overrides/` | Hero/card 均已批准进入本地 Published asset | 背景、透明边缘、主体完整度、裁切、文件路径 |
| 图片 Alt | Asset metadata | `src/data/speciesLandingPilot.ts` | 中文 Alt 已确认；英文继续 Draft | 只描述可确认身份/视觉，不写生物功效 |
| 介绍、环境、喂养、维护 | Base Editorial | 待审核编辑内容 | unavailable | 来源 ID、审核人、审核时间 |
| Variant 差异 | Variant Editorial | 待审核编辑内容 | unavailable | 只记录确认的差异；没有证据留空 |
| FAQ 3–5 条 | Base/Variant Editorial | 待事实审核的问题与答案 | unavailable | 未审核不显示、不生成 structured data |
| Category / Care / Compatibility 内链 | Site structure | 现有正式路由 | 可显示 | 目标路由可到达且不改变规则结论 |

## 素材验收清单（2026-09-01 项目负责人确认）

- [x] PNG 为 RGBA，背景透明，主体没有连边或白色裁切边。
- [x] 虾的触须、足、尾扇和外壳边缘完整。
- [x] 主体四周保留安全透明边距，Desktop/Mobile 均不被裁切。
- [x] Hero 与 Variant 卡片使用明确用途和稳定比例。
- [x] 图片失败时显示用户可理解的 fallback，不显示内部审核术语。
- [x] `hero` 与 `variantCard` 在代码清单中独立记录用途、路径、裁切和 Alt，即使当前复用同一文件。
- [x] 中文 Alt 经过项目负责人复核；英文 Alt 继续 Draft，不进入英文索引内容。

## 2026-08-30 视觉核查记录

以下记录包含自动化/辅助核查和 2026-09-01 项目负责人确认；不扩写任何生物事实。两张源图的 Hero 与卡片用途均已分别批准。

| 对象 | 源文件与尺寸 | Alpha / 主体检查 | Hero 用途 | Variant 卡片用途 | Fallback | 当前结论 |
|---|---|---|---|---|---|---|
| `sp_0001` 极火虾 | `public/species-image-overrides/sp_0001.png` · 560×318 | RGBA；触须、足、尾扇和主体边缘在当前预览中可见；透明背景 | 16:9、`contain`；按约 280px CSS 宽度显示，Hero approved | 4:3、`contain`；variant-card approved | 资源失败时显示通用物种图片 fallback | `approved`；确认人 `project-owner` |
| `sp_0030` 黄金米虾 | `public/species-image-overrides/sp_0030.png` · 576×334 | RGBA；触须、足、尾扇和主体边缘在当前预览中可见；透明背景 | 16:9、`contain`；按约 288px CSS 宽度显示，Hero approved | 4:3、`contain`；variant-card approved | 资源失败时显示通用物种图片 fallback | `approved`；确认人 `project-owner` |

- 核查方式：透明背景预览、浅色/深色背景下的主体完整度检查，以及 Figma Desktop/Mobile 公开页截图核对。
- 核查人：Codex 辅助核查；人工确认人：`project-owner`；确认时间：2026-09-01。
- 中文 Alt 已确认，仅描述可确认的物种名/颜色；英文 Alt 继续 Draft，不进入英文索引内容。
- 当前文件按实际 CSS 显示尺寸使用，不做无依据放大；文件变化或 Alt 变化后必须重新确认对应用途。

## 发布门禁

- 当前页面固定 `noindex,follow`。
- `unavailable`、`draft` 或 `needs_review` 不得进入 Published 聚合、Sitemap 或 structured data。
- Product Truth 不能被 SEO 文案或 Variant override 改写。
- 鱼缸适配结果只来自现有确定性规则引擎，不写入 SEO 内容矩阵。

## 2026-09-01 编辑证据候选层

已新增 `docs/species-seo-editorial-evidence-review.md` 与本地 `SpeciesEditorialEvidence` manifest。当前登记 9 条已确认表达：极火虾 5 条章节、3 条 FAQ，黄金米虾 1 条 Variant 差异；只有 fingerprint 匹配的 `confirmed` 内容进入 Published Profile。维护结论继续缺失，宝莲灯本批只保留既有 reviewed 群游证据。

候选使用 UF/IFAS、USGS NAS 和一篇同行评审研究作来源定位；来源改变、页面表达改变或来源失去资格时，fingerprint 门禁会使确认记录失效。项目负责人需逐条确认表达后，才能进入下一批的 `confirmed` 更新；当前页面仍 noindex。
