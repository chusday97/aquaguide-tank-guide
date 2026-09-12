# Release Checklist

在任何页面解除 `noindex,follow` 前，必须全部满足：

- [ ] 中文正文、FAQ、图片与 Alt 已确认且 fingerprint 匹配。
- [ ] Product Truth 与 AquaGuide catalog 一致。
- [ ] Canonical、页面意图和关键词归属已确认。
- [ ] JSON-LD 与可见内容一致，未审核内容不生成结构化数据。
- [ ] 390/600/1440px 浏览器回归、可访问性和性能通过。
- [ ] 可读独立 Critic 六维复验通过。
- [ ] Figma Canonical 与 Web 的字体、信息顺序和视觉令牌一致。
- [ ] 用户明确批准非生产预览后的单页放行。

当前默认状态：`noindex,follow`；不部署 Production。
