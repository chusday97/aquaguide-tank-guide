import { readFileSync, writeFileSync } from 'node:fs';

const replaceOnce = (source, from, to, label) => {
  if (!source.includes(from)) {
    throw new Error(`Drawer migration failed: ${label}`);
  }
  return source.replace(from, to);
};

const encyclopediaPath = 'src/pages/Encyclopedia.tsx';
let encyclopedia = readFileSync(encyclopediaPath, 'utf8');

if (!encyclopedia.includes("import { AdaptiveDetailContent } from '../components/common/AdaptiveDetailContent';")) {
  encyclopedia = replaceOnce(
    encyclopedia,
    "import { SpeciesDetailDialog } from '../components/SpeciesDetailDialog';\n",
    "import { SpeciesDetailDialog } from '../components/SpeciesDetailDialog';\nimport { AdaptiveDetailContent } from '../components/common/AdaptiveDetailContent';\n",
    'AdaptiveDetailContent import',
  );
}

encyclopedia = replaceOnce(
  encyclopedia,
  "      {viewMode === 'browse' ? (\n      <div className=\"flex flex-col gap-5\">",
  "      <div className=\"flex flex-col gap-5\">",
  'keep atlas mounted while compatibility drawer opens',
);

encyclopedia = replaceOnce(
  encyclopedia,
  "      </div>\n      ) : (\n        <div id=\"compatibility-calculator\" className=\"scroll-mt-6\">",
  "      </div>\n      {viewMode === 'compatibility' && (\n        <div id=\"compatibility-calculator\" className=\"scroll-mt-6\">",
  'render compatibility as overlay instead of page replacement',
);

encyclopedia = replaceOnce(
  encyclopedia,
  "    setCalculatorSpeciesIds(prev => prev.includes(fish.id) ? prev : [...prev, fish.id]);\n  };",
  "    setCalculatorSpeciesIds(prev => prev.includes(fish.id) ? prev : [...prev, fish.id]);\n    closeAtlasDetail(false);\n    setViewMode('compatibility');\n    navigateToRoute(taskRoutes.encyclopedia.compatibility);\n  };",
  'open checkout drawer immediately after adding a species',
);

const groupStart = encyclopedia.indexOf('      <Dialog open={!!selectedGroup}');
const groupEnd = encyclopedia.indexOf('      <SpeciesDetailDialog', groupStart);
if (groupStart < 0 || groupEnd < 0) throw new Error('Drawer migration failed: selected group dialog segment');
let groupSegment = encyclopedia.slice(groupStart, groupEnd);
groupSegment = replaceOnce(
  groupSegment,
  '        <DialogContent className="w-[94vw] max-w-[920px] overflow-hidden rounded-[24px] border-border bg-white p-0">',
  '        <AdaptiveDetailContent showCloseButton={false}>',
  'selected group centered dialog opening',
);
groupSegment = replaceOnce(
  groupSegment,
  '            <div className="flex max-h-[86dvh] flex-col">',
  '            <div className="flex min-h-0 flex-1 flex-col">',
  'selected group drawer height',
);
groupSegment = replaceOnce(
  groupSegment,
  '        </DialogContent>',
  '        </AdaptiveDetailContent>',
  'selected group centered dialog closing',
);
encyclopedia = `${encyclopedia.slice(0, groupStart)}${groupSegment}${encyclopedia.slice(groupEnd)}`;
writeFileSync(encyclopediaPath, encyclopedia);

const calculatorPath = 'src/components/CompatibilityRiskCalculator.tsx';
let calculator = readFileSync(calculatorPath, 'utf8');
calculator = replaceOnce(
  calculator,
  '    <div className="grid gap-4 rounded-[24px] border border-emerald-100 bg-white p-4 shadow-sm md:p-5">',
  '    <div data-surface="compatibility-checkout-drawer" className="fixed bottom-0 right-0 top-0 z-[80] grid h-[100dvh] w-full content-start gap-4 overflow-y-auto rounded-none border-l border-emerald-100 bg-white p-4 shadow-[-24px_0_60px_rgba(15,23,42,0.18)] animate-in slide-in-from-right-full duration-200 sm:w-[50vw] sm:min-w-0 sm:max-w-none sm:rounded-l-[28px] md:p-5">',
  'compatibility checkout drawer surface',
);
calculator = replaceOnce(
  calculator,
  '      <header className="flex flex-wrap items-start justify-between gap-3">',
  `      {onBrowseAtlas && (\n        <button\n          type="button"\n          onClick={onBrowseAtlas}\n          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-ink/50 shadow-sm transition-colors hover:border-emerald-200 hover:text-emerald-700"\n          aria-label={isEn ? 'Close compatibility plan' : '关闭混养方案'}\n        >\n          <X className="h-4 w-4" />\n        </button>\n      )}\n      <header className="flex flex-wrap items-start justify-between gap-3 pr-12">`,
  'compatibility drawer close control',
);
writeFileSync(calculatorPath, calculator);

const handoffPath = 'HANDOFF.md';
let handoff = readFileSync(handoffPath, 'utf8');
const handoffSection = `## 2026-08-12 右侧半屏 Drawer 交互基线\n\n- 桌面端“查看品类/物种详情/养护指南”等内容型详情统一从右侧滑入，严格占视口 50% 宽、100dvh 高；不再使用 94vw 居中大弹窗。手机端继续使用原 bottom sheet。\n- “加入混养计算”属于结算型任务：加入候选后直接打开右侧半屏混养方案 Drawer，左侧图鉴保持原位作为上下文，不再用 compatibility mode 替换整页内容。\n- 混养 Drawer 类似购物车结算：当前鱼缸是 baseline，准备加入的物种是候选项，用户可调整数量/移除候选/查看风险，并通过右上角关闭返回原图鉴。\n- ConfirmDialog 仍保持居中；右侧 Drawer 只用于内容阅读、对象详情和多步骤任务。\n\n`;
if (!handoff.includes('## 2026-08-12 右侧半屏 Drawer 交互基线')) {
  handoff = handoff.replace('# AquaGuide 交接文档\n\n', `# AquaGuide 交接文档\n\n${handoffSection}`);
  writeFileSync(handoffPath, handoff);
}

console.log('Right-half drawer UI migration applied.');
