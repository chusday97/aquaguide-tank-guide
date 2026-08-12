import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const path = 'evaluation/product/feature-states.v1.json';
let baseline = execFileSync('git', ['show', `origin/main:${path}`], { encoding: 'utf8' });
baseline = baseline.replace('"updatedAt": "2026-08-11"', '"updatedAt": "2026-08-13"');

const addition = `,
    {
      "id": "typography_system",
      "name": "语义排版系统",
      "states": [
        {"id":"semantic_hierarchy","scenario":"页面同时出现 page、section、card、body、meta、action 多层信息","expected":"共享语义层级保持稳定，主次关系跨页面一致","forbidden":"同一信息层级因页面不同随意切换字号和字重"},
        {"id":"legacy_migration","scenario":"旧页面仍保留部分 font-black/font-bold/text-[Npx]，新组件逐步迁移","expected":"共享组件分批迁移且旧页面视觉节奏不被一次性破坏","forbidden":"用全局 CSS 强制重写所有旧字号或字重"},
        {"id":"portal_surface","scenario":"Dialog/Drawer 通过 Portal 挂到 body","expected":"Portal 内仍可访问 Typography token，层级与页面内一致","forbidden":"因脱离 .aquaguide-app 祖先而回退到错误字号或字重"},
        {"id":"dense_metadata","scenario":"详情同时展示名称、结论、参数、来源和辅助标签","expected":"meta 信息保持次级但仍清晰可读，结论和主行动优先","forbidden":"所有文字都加粗或放大导致视觉权重相同"},
        {"id":"long_or_bilingual_copy","scenario":"中文、英文或较长物种/养护文案进入同一组件","expected":"文字允许合理换行且不破坏标题、正文、按钮层级","forbidden":"靠缩到不可读字号或截断核心结论维持布局"},
        {"id":"responsive_boundary","scenario":"手机、窄桌面与大桌面切换或浏览器字体放大","expected":"语义层级不因断点改变而反转，正文保持可读","forbidden":"移动端主任务文字比辅助 meta 更弱或出现横向溢出"}
      ]
    },
    {
      "id": "livestock_state_task",
      "name": "缸内生物状态与体态编辑",
      "states": [
        {"id":"browse_existing","scenario":"用户打开缸内生物并浏览当前数量、批次和体态","expected":"展示真实当前状态，并把编辑作为明确独立任务","forbidden":"浏览卡片本身隐式修改数量或状态"},
        {"id":"edit_in_progress","scenario":"进入单个物种的数量/日期/体态三步编辑","expected":"单物种编辑占满 editing surface 可用宽度并保留草稿","forbidden":"继续继承父级两列网格导致编辑器只有半宽"},
        {"id":"unsaved_navigation","scenario":"已有草稿时点击关闭、Esc、返回或切换页面","expected":"先触发未保存保护，再由用户决定继续编辑或放弃","forbidden":"先关闭或写入，再询问是否放弃修改"},
        {"id":"success","scenario":"用户核对并保存体态/数量变化","expected":"真实鱼缸状态、批次和相关时间线按同一操作结果更新","forbidden":"只显示成功 Toast 但底层数量或批次未变化"},
        {"id":"failure","scenario":"保存或 Repository 写入失败","expected":"保留草稿、显示可理解提示并允许稳定重试","forbidden":"清空草稿、展示 raw error 或把失败状态当作已保存"},
        {"id":"partial_group_boundary","scenario":"只调整同一物种中的部分数量或存在多个批次","expected":"明确本次影响数量，保持总数量守恒并让用户核对目标批次","forbidden":"部分编辑意外覆盖全部生物，或拆分后总数量发生变化"}
      ]
    }`;

const marker = '\n  ]\n}';
const index = baseline.lastIndexOf(marker);
if (index < 0) throw new Error('Feature registry closing marker not found');
const minimized = `${baseline.slice(0, index)}${addition}${baseline.slice(index)}`;
JSON.parse(minimized);
fs.writeFileSync(path, minimized);
console.log('Rebuilt feature registry from main with only two compact feature additions.');
