# AquaGuide HTML UI Freeze v3 · 4198

这是独立静态 HTML 原型，不读取 React、Supabase、Catalog 或外部 API，也不会保存真实数据。

本目录将 4196 的鱼缸/水族册结构与 4197 的图鉴/养护/混养结构组合为单一评审入口。运行时不访问 React、Supabase、Catalog 或外部 API。

```bash
python3 -m http.server 4198 --directory prototypes/aquaguide-ui-freeze-v3
```

打开 `http://127.0.0.1:4198/`。直接页面：

- `/pages/encyclopedia.html`
- `/pages/care.html`
- `/pages/compatibility.html`

4196 是冻结的原始参考；4197 是产品评审参考；4319 仅作为当前 React 问题证据。组合包包含五个页面：Aquarium、Collection、Encyclopedia、Care、Compatibility。只有产品经理将区块标记为 `ACCEPTED` 后，才进入 HTML block → React component → route → acceptance case 映射。

离线评审包位于仓库外的 `/private/tmp/AquaGuide-Product-Review-v2.zip`，解压后双击 `打开评审台.html` 即可运行。
