import { readFileSync, writeFileSync } from 'node:fs';

const path = 'HANDOFF.md';
const text = readFileSync(path, 'utf8');
const marker = '## Task-entry / Deep-link contract (2026-08-11)';
const markerIndex = text.indexOf(marker);
if (markerIndex < 0) throw new Error('Task-entry marker not found in HANDOFF.md');

const prefix = `# AquaGuide 交接文档\n\n## 2026-08-12 Surface Sizing + Typography Migration + 收藏滑动卡片基线\n\n- 桌面 Drawer 不再统一使用 50vw。Surface 按任务密度分级：阅读/详情约 520px、编辑任务约 560px、复杂决策约 640px；所有宽度必须再受固定侧栏之后的真实剩余工作区限制。手机端继续使用原有 bottom sheet / mobile task surface。\n- “调整缸内物种体态”保留单物种编辑一列修复：进入编辑后单个编辑器占满 Drawer 可用宽度，不得继承缸内物种列表的两列网格。\n- 物种详情、品类详情与养护指南属于 reading surface；缸内体态/设置等属于 editing surface；混养结算属于 decision surface。ConfirmDialog 仍保持居中短决策。\n- Typography 只提供 page / section / card / body / meta / action 语义层级；不得通过全局 CSS 强制重写所有 font-black/font-bold/font-semibold 或 text-[Npx]。旧页面按共享组件逐步迁移，避免一次性改变导航、标签、卡片等既有节奏。\n- 语义 Typography 与 Surface token 必须定义在 Portal 可访问的作用域；Dialog/Drawer 挂载到 body 时不能因为脱离 .aquaguide-app 而回退到错误字号或宽度。\n- 水族册首页模块预览、种草收藏和养护收藏使用横向可滑动 snap 卡片轨道；手机露出下一张卡作为滑动提示，桌面支持触控板/横向滚动。生命纪念保持自己的浏览结构；成就继续保持建设中且不展示真实进度。\n- Card 仍遵守 Card=Open object：点击收藏卡直接进入对应物种/养护详情；详情再按 Surface Sizing contract 展示。\n- 回归门禁：test:responsive-detail-surface + test:typography-system + test:collection-swipe-cards + test:collection-hub-ui + test:livestock-state-surface + test:livestock-state-drawer-ui + test:guided-navigation-ui + lint + build。\n\n`;

const next = prefix + text.slice(markerIndex);
if (next.includes('严格占视口 50%') || next.includes('右侧 50vw × 100dvh Drawer') || next.includes('旧 arbitrary size 在全局 typography baseline 中归并')) {
  throw new Error('Legacy UI baseline text still present after migration');
}
writeFileSync(path, next);
console.log('HANDOFF UI baseline migrated.');
