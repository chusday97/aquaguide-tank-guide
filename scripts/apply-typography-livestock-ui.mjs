import { readFileSync, writeFileSync } from 'node:fs';

const replaceOnce = (source, from, to, label) => {
  if (!source.includes(from)) throw new Error(`UI migration failed: ${label}`);
  return source.replace(from, to);
};

// 1) Activate the global typography baseline after Tailwind so its scoped normalization wins.
const cssPath = 'src/index.css';
let css = readFileSync(cssPath, 'utf8');
if (!css.includes('@import "./styles/typography-system.css";')) {
  css = replaceOnce(
    css,
    '@import "tailwindcss";\n',
    '@import "tailwindcss";\n@import "./styles/typography-system.css";\n',
    'typography import',
  );
  writeFileSync(cssPath, css);
}

// 2) Move aquarium workspace headings onto the same semantic type scale.
const aquariumPath = 'src/pages/Aquarium.tsx';
let aquarium = readFileSync(aquariumPath, 'utf8');
aquarium = replaceOnce(
  aquarium,
  '<h2 id={titleId} className="block text-[14px] font-black leading-tight text-ink">{title}</h2>\n        {subtitle && <span className="mt-0.5 block text-[10px] font-bold leading-4 text-ink/45">{subtitle}</span>}',
  '<h2 id={titleId} className="type-card-title block text-ink">{title}</h2>\n        {subtitle && <span className="type-meta mt-1 block text-ink/48">{subtitle}</span>}',
  'aquarium zone typography',
);
writeFileSync(aquariumPath, aquarium);

// 3) Livestock roster/detail is a content/task surface, not a narrow centered modal.
const rosterPath = 'src/components/aquarium/LivestockRosterDialog.tsx';
let roster = readFileSync(rosterPath, 'utf8');
if (!roster.includes("import { AdaptiveDetailContent } from '../common/AdaptiveDetailContent';")) {
  roster = replaceOnce(
    roster,
    "import { SurfaceHeader } from '../common/SurfaceHeader';\n",
    "import { SurfaceHeader } from '../common/SurfaceHeader';\nimport { AdaptiveDetailContent } from '../common/AdaptiveDetailContent';\n",
    'livestock adaptive detail import',
  );
}

const primaryDialogStart = roster.indexOf('      <Dialog open={open} onOpenChange={requestRosterOpenChange}>');
const nextDialogStart = roster.indexOf('      <Dialog open={isRosterCloseConfirmOpen}', primaryDialogStart);
if (primaryDialogStart < 0 || nextDialogStart < 0) throw new Error('UI migration failed: livestock primary dialog segment');
let primaryDialog = roster.slice(primaryDialogStart, nextDialogStart);
primaryDialog = replaceOnce(
  primaryDialog,
  '<DialogContent showCloseButton={false} className="flex h-[92dvh] max-h-[92dvh] w-[min(94vw,900px)] max-w-[900px] flex-col overflow-hidden rounded-[28px] p-0 sm:h-auto sm:max-h-[88dvh]">',
  '<AdaptiveDetailContent showCloseButton={false} className="livestock-roster-surface">',
  'livestock centered surface opening',
);
primaryDialog = replaceOnce(
  primaryDialog,
  '<div className="grid gap-3 md:grid-cols-2">\n                {displayedRecords.map',
  '<div className={editingRecordId ? \'grid grid-cols-1 gap-3\' : \'grid gap-3 md:grid-cols-2\'}>\n                {displayedRecords.map',
  'livestock editing full-width grid',
);
primaryDialog = replaceOnce(
  primaryDialog,
  '        </DialogContent>\n      </Dialog>',
  '        </AdaptiveDetailContent>\n      </Dialog>',
  'livestock centered surface closing',
);
roster = `${roster.slice(0, primaryDialogStart)}${primaryDialog}${roster.slice(nextDialogStart)}`;
writeFileSync(rosterPath, roster);

// 4) Permanent test commands.
const packagePath = 'package.json';
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
pkg.scripts['test:typography-system'] = 'node scripts/test-typography-system.mjs';
pkg.scripts['test:livestock-state-surface'] = 'node scripts/test-livestock-state-surface.mjs';
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

// 5) Record the structural design-system decision.
const handoffPath = 'HANDOFF.md';
let handoff = readFileSync(handoffPath, 'utf8');
const section = `## 2026-08-12 Typography + 任务 Drawer 基线\n\n- 全站文字不再通过大量 8/9/10/11/12/13/14/15/16px 与 font-black 自由组合制造层级。统一采用有限的 display / section / card / body / meta / action 语义层级；旧 arbitrary size 在全局 typography baseline 中归并，900/800 重字重收敛。\n- 共享 SurfaceHeader、SectionHeader 与鱼缸分区标题优先使用语义 typography class，新 UI 不再新增任意字号 + font-black 组合。\n- 桌面多步骤任务使用右侧 50vw × 100dvh Drawer；手机保持各任务原有 mobile surface。短确认仍使用居中 ConfirmDialog。\n- “调整缸内物种体态”进入单物种编辑后必须占满 Drawer 可用宽度，不得继续继承缸内物种列表的两列网格。\n- 回归门禁：test:typography-system + test:livestock-state-surface + test:responsive-detail-surface；涉及体态编辑时同时运行 test:guided-navigation-ui。\n\n`;
if (!handoff.includes('## 2026-08-12 Typography + 任务 Drawer 基线')) {
  handoff = handoff.replace('# AquaGuide 交接文档\n\n', `# AquaGuide 交接文档\n\n${section}`);
  writeFileSync(handoffPath, handoff);
}

console.log('Typography + livestock task UI migration applied.');
