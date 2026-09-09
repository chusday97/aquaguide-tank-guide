# Public SEO 内容与素材审核矩阵

状态说明：本表只登记来源与发布门禁，不代表内容已经通过人工审核。未满足“来源、审核人、审核时间、中文状态”四项的内容不得进入公开聚合、页面 metadata、JSON-LD 或 Sitemap。

| 对象 | 层级 / 类型 | Product Truth 来源 | Editorial / FAQ / Alt / Asset 来源 | 中文状态 | 英文状态 | 公开 | 索引 | 素材门禁 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 虾螺蟹 | Category | `fishData.ts` 分类字段 | 分类公开登记 | Draft | Draft | 否 | noindex | 无专属 Hero |
| 极火虾 `sp_0001` | Base Species | `fishData.ts` | 正文/FAQ 待登记；Hero/card/中文 Alt 已确认 | 内容待审核；素材 approved | Draft | 否 | noindex | Hero/card 用途级确认已完成 |
| 宝莲灯 `sp_0432` | Behavior sample | `fishData.ts`；reviewed 群游证据 | 仅允许现有 reviewed trait | needs_review | Draft | 否 | noindex | 缺正式 Hero/Alt 审核 |
| 黄金米虾 `sp_0030` | Variant | `fishData.ts` | Variant 差异待登记；Hero/card/中文 Alt 已确认 | 内容待审核；素材 approved | Draft | canonical-to-base / noindex | Variant Hero/card 用途级确认已完成 |
| 新鱼入缸 `guide_new_fish_acclimation` | Guide | 不覆盖 Product Truth | `careActionReviewRegistry` 当前为空 | Draft | Draft | 否 | noindex | 正文动作和图片均不公开 |

## 固定审核字段

- 来源 ID、来源路径、审核人、审核时间。
- 中文公开状态、英文 Draft/review 状态、是否公开、是否允许索引。
- Hero/card 用途、目标比例、实际尺寸、裁切方式、失败 fallback。
- Alt 必须描述可确认的视觉内容；自动生成的名称或学名文本不等于人工审核 Alt。
- 没有证据的字段保持空白，不使用通用文案补齐。
