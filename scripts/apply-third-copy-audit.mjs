import { readFileSync, writeFileSync } from 'node:fs';

const edit = (path, transform) => {
  const original = readFileSync(path, 'utf8');
  const next = transform(original);
  if (next !== original) {
    writeFileSync(path, next, 'utf8');
    console.log(`updated ${path}`);
  } else {
    console.log(`no changes ${path}`);
  }
};

const replaceAll = (source, from, to, label = from) => {
  if (!source.includes(from)) {
    console.log(`skip missing: ${label}`);
    return source;
  }
  return source.split(from).join(to);
};

edit('src/components/CompatibilityRiskCalculator.tsx', source => {
  const replacements = [
    ["description: isEn ? 'At least one blocking conflict was found.' : '当前组合命中明确阻断风险，不建议按现在的组合入缸。'", "description: isEn ? 'This combination has a clear conflict and is not recommended.' : '存在明确冲突，不建议一起养。'"],
    ["description: isEn ? 'No hard block, but one or more conditions require attention.' : '没有硬性阻断，但存在需要先调整或持续观察的条件。'", "description: isEn ? 'This combination may work if the conditions below are met.' : '可以尝试，但需要满足以下条件。'"],
    ["description: isEn ? 'The rules are missing data required for a reliable decision.' : '缺少关键鱼缸参数，当前不应给出确定的混养结论。'", "description: isEn ? 'Complete the tank details before deciding whether these species can live together.' : '先补充鱼缸参数，再判断是否适合混养。'"],
    ["description: isEn ? 'No blocking conflict was found in the current rules.' : '当前规则没有发现明确阻断风险，仍建议少量加入并观察。'", "description: isEn ? 'No obvious conflict was found. Add gradually and observe.' : '目前没有发现明显冲突，建议少量加入并观察。'"],
    ["          detail: isEn ? `It conflicts with livestock already in the tank. ${reason}` : `它与当前缸内已有生物 ${pair.speciesB.name} 存在阻断冲突。${reason}`", "          detail: isEn ? `It is not suitable with ${getSpeciesName(pair.speciesB, true)}: ${reason}` : `它与 ${pair.speciesB.name} 不适合一起养：${reason}`"],
    ["          detail: isEn ? `It conflicts with livestock already in the tank. ${reason}` : `它与当前缸内已有生物 ${pair.speciesA.name} 存在阻断冲突。${reason}`", "          detail: isEn ? `It is not suitable with ${getSpeciesName(pair.speciesA, true)}: ${reason}` : `它与 ${pair.speciesA.name} 不适合一起养：${reason}`"],
    ["          detail: isEn ? `This is an existing-tank issue, not a new-addition decision. ${reason}` : `这是当前鱼缸已经存在的风险，不应该由混养工具擅自删除任何生物。${reason}`", "          detail: isEn ? `This conflict already exists in the current tank. Adjust the current stocking first. ${reason}` : `这个风险已经存在于当前鱼缸，请先调整缸内组合。${reason}`"],
    ["'1. What do you want to add?'", "'What do you want to add?'"],
    ["'1. 你准备加入什么？'", "'你准备加入什么？'"],
    ["'1. Select species to compare'", "'Select species to compare'"],
    ["'1. 选择要比较的生物'", "'选择要比较的生物'"],
    ["'One new species is enough; existing livestock is included automatically.'", "'Existing livestock is included automatically.'"],
    ["'只选 1 种新生物也可以，系统会自动与缸内已有生物比较。'", "'已有生物会自动纳入判断'"],
    ["'2. Compatibility decision'", "'Compatibility result'"],
    ["'2. 混养结论'", "'混养结果'"],
    ["'Blocking conflicts'", "'Conflicting pairs'"],
    ["'阻断冲突'", "'不适合的组合'"],
    ["'Missing information'", "'Complete these details'"],
    ["'还缺这些信息'", "'补充这些信息'"],
    ["'3. Choose how to adjust'", "'How to adjust?'"],
    ["'3. 直接选择怎么调整'", "'怎么调整？'"],
    ["'AI is reading this tank and rule result…'", "'Generating suggestions…'"],
    ["'AI 正在读取当前鱼缸和规则结果…'", "'正在生成建议…'"],
    ["'AI summary'", "'Overview'"],
    ["'AI 总结'", "'建议概览'"],
  ];
  for (const [from, to] of replacements) source = replaceAll(source, from, to);

  source = replaceAll(
    source,
    "  // In a real tank, existing livestock is the baseline. User selections are the planned additions.\n  // If every selected species is already in the tank, fall back to compare-selected mode instead of pretending they are additions.\n",
    '',
    'internal compatibility comments',
  );

  source = replaceAll(
    source,
    "const unique = <T,>(items: T[]) => Array.from(new Set(items));\n",
    `const unique = <T,>(items: T[]) => Array.from(new Set(items));\n\nconst getConflictActionLabel = (action: ConflictAction, isEn: boolean) => {\n  if (!action.removeSpeciesId) return isEn ? 'Review current tank' : '查看当前鱼缸';\n  const species = fishData.find(item => item.id === action.removeSpeciesId);\n  const name = species ? getSpeciesName(species, isEn) : (isEn ? 'this species' : '该生物');\n  const isSkip = action.title.startsWith(isEn ? 'Do not add ' : '不要加入 ');\n  return isSkip\n    ? (isEn ? 'Do not add ' + name : '不加入 ' + name)\n    : (isEn ? 'Remove ' + name : '移除 ' + name);\n};\n`,
    'action button helper',
  );

  source = replaceAll(
    source,
    "  const contextLabel = selectedAquarium\n    ? `${selectedAquarium.name} · ${getAquariumVolumeLiters(selectedAquarium) || '--'}L · ${existingLivestock.length} ${isEn ? 'existing species' : '种已有生物'}`\n    : (isEn ? 'No tank selected · comparison only' : '未选择鱼缸 · 仅比较所选组合');",
    "  const aquariumVolume = selectedAquarium ? getAquariumVolumeLiters(selectedAquarium) : null;\n  const contextLabel = selectedAquarium\n    ? [\n      selectedAquarium.name,\n      aquariumVolume ? `${aquariumVolume}L` : '',\n      `${existingLivestock.length} ${isEn ? 'existing species' : '种已有生物'}`,\n    ].filter(Boolean).join(' · ')\n    : (isEn ? 'No tank selected · comparison only' : '未选择鱼缸 · 仅比较所选组合');",
    'tank context label',
  );

  source = source.replace(/\s*<div className="text-\[11px\] font-black uppercase tracking-\[0\.16em\] text-emerald-700">\{isEn \? 'Mixing planner' : '混养决策'\}<\/div>\n?/, '\n');
  source = source.replace(/\s*<div className="text-\[10px\] font-bold text-ink\/40">\{isEn \? 'Compatibility' : '混养结果'\}<\/div>\n?/, '\n');
  source = source.replace(/\s*<p className="mt-1 text-\[10px\] font-bold leading-5 text-ink\/45">\{isEn \? 'AquaGuide does not guess which animal matters more to you\. It shows the safe choices explicitly\.' : '选择一个调整方案后会立即重新计算。'\}<\/p>\n?/, '\n');
  source = source.replace(/\s*<DialogDescription className="text-xs font-semibold leading-5 text-ink\/50">\{isEn \? 'Deterministic rules keep the final safety status\. AI explains the evidence and organizes options\.' : '基于当前鱼缸和风险结果给出调整建议。'\}<\/DialogDescription>\n?/, '\n');
  source = source.replace(/\s*<div className="mt-1 text-\[9px\] font-bold text-ink\/35">\{item\.source\}<\/div>\n?/, '\n');

  source = replaceAll(
    source,
    "{isEn ? 'Apply this adjustment' : '按这个方案调整'}",
    "{getConflictActionLabel(action, isEn)}",
    'conflict action button label',
  );

  source = replaceAll(
    source,
    "{aiResult.source === 'model' ? (isEn ? '✓ DeepSeek model response' : 'AI 已生成') : (isEn ? 'Fallback response · AI did not participate' : 'AI 暂不可用')}\n                  {aiResult.failureReason ? ` · ${aiResult.failureReason}` : ''}",
    "{aiResult.source === 'model' ? (isEn ? 'AI generated' : 'AI 已生成') : (isEn ? 'AI unavailable. Please try again later.' : 'AI 暂不可用，请稍后再试')}",
    'AI source status',
  );

  source = replaceAll(
    source,
    "<div className=\"rounded-[14px] bg-slate-50 px-3 py-2 text-[10px] font-bold leading-5 text-ink/45\">{aiResult.disclaimer}</div>",
    "<div className=\"rounded-[14px] bg-slate-50 px-3 py-2 text-[10px] font-bold leading-5 text-ink/45\">{isEn ? 'Check the advice against actual water conditions and livestock behavior.' : '请结合实际水质和生物状态判断。'}</div>",
    'AI disclaimer display',
  );

  return source;
});

edit('src/components/SpeciesDetailDialog.tsx', source => {
  source = replaceAll(source, "isEn ? 'Current tank fit' : '当前鱼缸适配'", "isEn ? 'Fits my tank?' : '适合我的鱼缸吗？'");
  source = replaceAll(source, "isEn ? 'Tank fit evidence' : '适配依据'", "isEn ? 'Why?' : '为什么？'");
  source = replaceAll(
    source,
    "? (isEn ? `${metricCards.filter(item => item.status !== 'ok').length} items need attention` : `${metricCards.filter(item => item.status !== 'ok').length} 项需要留意`)",
    "? (() => { const count = metricCards.filter(item => item.status !== 'ok').length; return count === 0 ? (isEn ? 'No obvious issues' : '目前没有明显问题') : (isEn ? `${count} items need attention` : `${count} 项需要留意`); })()",
    'fit attention count',
  );
  return source;
});

edit('src/pages/Aquarium.tsx', source => {
  source = replaceAll(
    source,
    '<span className="mt-0.5 block text-[10px] font-bold leading-4 text-ink/45">{subtitle}</span>',
    '{subtitle && <span className="mt-0.5 block text-[10px] font-bold leading-4 text-ink/45">{subtitle}</span>}',
    'conditional zone subtitle',
  );
  return source;
});

edit('src/pages/Settings.tsx', source => {
  source = source.replace(/\n\s*<p className="mt-1 text-sm font-semibold leading-6 text-ink\/48">\{t\('settingsPage\.subtitle'\)\}<\/p>/, '');
  return source;
});

edit('src/i18n/index.ts', source => {
  const replacements = [
    ["localDataHint: '数据保存在当前浏览器，切换设备前请先同步或导出。'", "localDataHint: '数据目前保存在当前浏览器。'"],
    ["localDataHint: 'Data is stored in this browser. Sync or export before switching devices.'", "localDataHint: 'Data is currently stored in this browser.'"],
    ["subtitle: '只展示当前真正可用的选项。'", "subtitle: ''"],
    ["subtitle: 'Only currently available options are shown.'", "subtitle: ''"],
    ["zoneObserveHint: '先看今天的鱼缸，再决定是否需要处理。'", "zoneObserveHint: ''"],
    ["zoneManageHint: '管理缸内物种，并快速记录日常操作。'", "zoneManageHint: ''"],
    ["zoneLearnHint: '发现适合的物种，按需要了解进阶参数。'", "zoneLearnHint: ''"],
    ["zoneObserveHint: 'Check today’s tank first, then decide whether action is needed.'", "zoneObserveHint: ''"],
    ["zoneManageHint: 'Manage livestock and quickly record routine care.'", "zoneManageHint: ''"],
    ["zoneLearnHint: 'Discover suitable species and open advanced details only when needed.'", "zoneLearnHint: ''"],
    ["carePlanEmptyHint: '可以从操作指南设置观察或维护日期。'", "carePlanEmptyHint: '从养护指南添加计划。'"],
    ["carePlanEmptyHint: 'Set an observation or maintenance date from a care guide.'", "carePlanEmptyHint: 'Add a plan from a care guide.'"],
    ["fitStatusMatchConfirm: '基础条件匹配，建议补充确认'", "fitStatusMatchConfirm: '基本适合，还需要确认部分信息'"],
    ["fitStatusMatchConfirm: 'Parameters match, verification recommended'", "fitStatusMatchConfirm: 'Generally suitable, with a few details to confirm'"],
    ["conclusionNoTank: '尚未选择鱼缸，选择或创建鱼缸后再判断环境适配。'", "conclusionNoTank: '选择鱼缸后可查看适配结果。'"],
    ["conclusionNoTank: 'No tank selected. Select or create a tank first to check environment fit.'", "conclusionNoTank: 'Select a tank to see fit results.'"],
    ["conclusionNoPairs: '当前鱼缸没有可与该物种逐对比较的其他活体。'", "conclusionNoPairs: '鱼缸里还没有其他生物可进行混养判断。'"],
    ["conclusionNoPairs: 'No other livestock in current tank for pairwise compatibility check.'", "conclusionNoPairs: 'There are no other livestock in this tank to compare yet.'"],
    ["actionNoPairs: '进入完整混养计算，调整组合或补充鱼缸信息。'", "actionNoPairs: '添加其他生物后可进行混养判断。'"],
    ["actionNoPairs: 'Enter full calculator to adjust stock or complete tank parameters.'", "actionNoPairs: 'Add another species to check compatibility.'"],
  ];
  for (const [from, to] of replacements) source = replaceAll(source, from, to);
  return source;
});

console.log('Third UI copy audit applied.');
