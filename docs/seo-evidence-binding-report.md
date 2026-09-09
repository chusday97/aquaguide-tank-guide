# SEO 证据绑定报告

更新时间：2026-09-01
范围：本地 `feature/admin-content-v0`，中文 `zh-CN` 试点

这份报告回答的是：公开页面表达是否绑定到 AquaGuide 已有的 Product Truth、`reviewed` 证据或素材记录。`confirmed` 表示来源字段与页面表达的绑定基线已核对，不表示新增了一轮独立的生物学研究；`stale` 表示来源指纹变化，需要重新确认；`blocked` 表示当前来源或素材还不能公开。

| 页面表达 / 绑定 | 来源 ID | 当前状态 | 最后确认 |
| --- | --- | --- | --- |
| `sp_0001` 目录摘要：名称、学名、参数 | `fishData.ts:sp_0001` | `confirmed` | 2026-08-31 |
| `sp_0030` 目录摘要：名称、学名、参数 | `fishData.ts:sp_0030` | `confirmed` | 2026-08-31 |
| `sp_0432` 目录摘要：名称、学名、参数 | `fishData.ts:sp_0432` | `confirmed` | 2026-08-31 |
| 宝莲灯群游倾向、最低群体数量 | `fishbase-paracheirodon-axelrodi` | `confirmed` | 2026-08-31 |
| 极火虾 Hero 素材与中文 Alt | `/species-image-overrides/sp_0001.png` | `confirmed` | 2026-09-01 |
| 极火虾 Variant 卡片素材与中文 Alt | `/species-image-overrides/sp_0001.png` | `confirmed` | 2026-09-01 |
| 黄金米虾 Hero 素材与中文 Alt | `/species-image-overrides/sp_0030.png` | `confirmed` | 2026-09-01 |
| 黄金米虾 Variant 卡片素材与中文 Alt | `/species-image-overrides/sp_0030.png` | `confirmed` | 2026-09-01 |

当前已进入本地 Published Profile 的是 9 条 fingerprint 匹配的确认表达：极火虾 5 条章节、3 条 FAQ，以及黄金米虾 1 条 Variant 差异。它们仍不解除页面 `noindex`，也不自动生成 Article、FAQPage 或 Sitemap 项。新鱼入缸指南没有进入公开聚合，因为动作审核登记为空。

变更检查：

- Product Truth、`reviewed` 证据或引用状态变化会改变指纹；依赖的表达变为 `stale` 或 `blocked`。
- 图片文件 SHA-256 由 `npm run test:seo-evidence-bindings` 对照清单检查；文件变化后必须重新进行视觉、Alt 和清晰度确认。
- CSS 或布局变化不改变事实指纹。
- `assetPreview=1` 只在 localhost 开发模式允许 review-only 预览；本次确认后普通页面显示 approved 素材，但不改变 `noindex` 或 JSON-LD 发布门禁。
- 任一关键绑定失效时，页面继续保持 `noindex,follow`。

复核命令：

```bash
npm run test:seo-evidence-bindings
```
