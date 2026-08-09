import { readFileSync, writeFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const write = (path, value) => writeFileSync(path, value, 'utf8');
const requiredReplace = (source, from, to, label) => {
  if (!source.includes(from)) throw new Error(`Missing pattern: ${label}`);
  return source.replace(from, to);
};
const requiredRegex = (source, pattern, to, label) => {
  if (!pattern.test(source)) throw new Error(`Missing regex pattern: ${label}`);
  pattern.lastIndex = 0;
  return source.replace(pattern, to);
};

// 1) Centralize all unfinished-feature gates and use a muted gray visual state.
{
  const path = 'src/components/layout/WorkspaceNavigationProvider.tsx';
  let source = read(path);
  source = requiredReplace(
    source,
    "  kind: 'auth' | 'achievements';",
    "  kind: 'auth' | 'achievements' | 'imageExport' | 'sharing';",
    'feature preview union',
  );
  source = requiredRegex(
    source,
    /const buildFeaturePreview = \(kind: 'auth' \| 'achievements'\): FeaturePreviewState => \{[\s\S]*?\n\};\n\nconst getWorkspaceScroller/,
    `const buildFeaturePreview = (kind: 'auth' | 'achievements' | 'imageExport' | 'sharing'): FeaturePreviewState => {\n  const isEn = isEnglishUi();\n  if (kind === 'auth') {\n    return {\n      kind,\n      title: isEn ? 'Cloud sync is coming' : '云端同步 · 建设中',\n      description: isEn ? 'Sign in will sync tanks and care records across devices.' : '登录后可跨设备同步鱼缸和养护记录。',\n    };\n  }\n  if (kind === 'achievements') {\n    return {\n      kind,\n      title: isEn ? 'Achievements are coming' : '成就勋章 · 建设中',\n      description: isEn ? 'Track long-term care milestones.' : '记录你的养护里程碑。',\n    };\n  }\n  if (kind === 'sharing') {\n    return {\n      kind,\n      title: isEn ? 'Sharing is coming' : '分享功能 · 建设中',\n      description: isEn ? 'Share links and privacy controls are being completed.' : '分享链接与隐私管理正在完善。',\n    };\n  }\n  return {\n    kind,\n    title: isEn ? 'Image export is coming' : '图片导出 · 建设中',\n    description: isEn ? 'Saving generated cards as images is being completed.' : '图片保存与导出功能正在完善。',\n  };\n};\n\nconst getWorkspaceScroller`,
    'feature preview builder',
  );
  source = requiredReplace(
    source,
    "  const showFeaturePreview = useCallback((kind: 'auth' | 'achievements') => {",
    "  const showFeaturePreview = useCallback((kind: 'auth' | 'achievements' | 'imageExport' | 'sharing') => {",
    'feature preview callback union',
  );
  source = requiredRegex(
    source,
    /  useEffect\(\(\) => \{\n    const handleFeaturePreviewEvent[\s\S]*?\n  \}, \[showFeaturePreview\]\);/,
    `  useEffect(() => {\n    const resolveBuildingFeature = (target: HTMLElement): FeaturePreviewState['kind'] | null => {\n      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || '' : '';\n      const text = (target.textContent || '').replace(/\\s+/g, ' ').trim();\n      if (/^\\/login(?:[/?#]|$)/.test(href)) return 'auth';\n      if (/^\\/collection\\/achievements(?:[/?#]|$)/.test(href) || /成就勋章|Achievements|Badges/i.test(text)) return 'achievements';\n      if (/分享与隐私|Sharing & privacy|生成分享报告|Create share report|生成报告链接|Create report link|打开导出与分享|Open export & share/i.test(text)) return 'sharing';\n      if (/保存图片|Save image|保存 PNG|Save PNG|下载图片|Download image|预览并下载|Preview & download|导出物种卡片|Export species card|导出卡片|Export card|导出档案|Export archive|百日.*导出|Export.*milestone/i.test(text)) return 'imageExport';\n      return null;\n    };\n\n    const markBuildingTargets = () => {\n      document.querySelectorAll<HTMLElement>('button, a, [role="button"]').forEach(target => {\n        const kind = resolveBuildingFeature(target);\n        if (!kind) return;\n        target.dataset.featureBuilding = kind;\n        target.style.backgroundColor = '#f1f5f9';\n        target.style.color = '#94a3b8';\n        target.style.borderColor = '#e2e8f0';\n        target.style.boxShadow = 'none';\n      });\n    };\n\n    const handleFeaturePreviewEvent = (event: Event) => {\n      const feature = (event as CustomEvent<{ feature?: string }>).detail?.feature || '';\n      if (/^auth/i.test(feature)) showFeaturePreview('auth');\n      else if (/achievement|badge|medal|成就|勋章/i.test(feature)) showFeaturePreview('achievements');\n      else if (/share|sharing|分享/i.test(feature)) showFeaturePreview('sharing');\n      else if (/image|export|download|导出|图片/i.test(feature)) showFeaturePreview('imageExport');\n    };\n    const handleFeatureClick = (event: MouseEvent) => {\n      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, a, [role="button"]') : null;\n      if (!target) return;\n      const kind = resolveBuildingFeature(target);\n      if (!kind) return;\n      event.preventDefault();\n      event.stopPropagation();\n      showFeaturePreview(kind);\n    };\n    markBuildingTargets();\n    const observer = new MutationObserver(markBuildingTargets);\n    observer.observe(document.body, { childList: true, subtree: true });\n    window.addEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);\n    document.addEventListener('click', handleFeatureClick, true);\n    return () => {\n      observer.disconnect();\n      window.removeEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);\n      document.removeEventListener('click', handleFeatureClick, true);\n    };\n  }, [showFeaturePreview]);`,
    'feature preview event handler',
  );
  source = requiredReplace(
    source,
    'className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-800"',
    'className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500"',
    'feature preview badge gray',
  );
  write(path, source);
}

// 2) First copy-review batch.
{
  const path = 'src/App.tsx';
  let source = read(path);
  source = requiredReplace(
    source,
    "{isEn ? 'This entry may have changed. Return to your tank or search species and care guides.' : '这个入口可能已经更新。你可以回到鱼缸，或搜索物种和养护指南。'}",
    "{isEn ? 'This page does not exist or has been removed.' : '页面不存在或已被移除。'}",
    '404 copy',
  );
  write(path, source);
}

{
  const path = 'src/pages/CareEncyclopedia.tsx';
  let source = read(path);
  const copyPairs = [
    ['当前鱼缸最近新增了生物，优先确认过水和入缸观察。', '最近添加了新生物'],
    ['当前鱼缸像新缸状态，先看白浊和开缸稳定问题。', '新缸优先检查水质稳定情况'],
    ['已记录怀孕、生产或产后恢复状态，优先查看对应观察与护理。', '有生物处于繁殖阶段'],
    ['当前鱼缸有繁殖或鱼苗相关生物，建议提前看护理节奏。', ''],
    ['当前鱼缸设备信息不完整，建议先确认过滤和维护方式。', '过滤设备尚未设置'],
    ['当前暂无换水记录，建议建立稳定换水流程。', '还没有换水记录'],
    ['作为日常兜底，水质异常排查最常用。', ''],
    ['还没有当前鱼缸数据，先推荐通用水质排查。', '暂无鱼缸数据'],
    ['新鱼、新虾入缸前后都适合快速复查。', ''],
    ['基础养护高频内容，适合建立固定流程。', ''],
    ["'已按标题、简介、分类和关键词筛选。'", "''"],
    ["'这里收纳你常用的养护文章。'", "''"],
    ["`当前分类：${getCategoryLabel(activeCategory)}`", "''"],
  ];
  for (const [from, to] of copyPairs) {
    if (!source.includes(from)) throw new Error(`Missing care copy: ${from}`);
    source = source.replaceAll(from, to);
  }
  source = requiredReplace(
    source,
    '<span className="block text-[10px] font-black text-emerald-700">{getRecommendationReasonLocalized(reason, isEn)}</span>',
    '{reason && <span className="block text-[10px] font-black text-emerald-700">{getRecommendationReasonLocalized(reason, isEn)}</span>}',
    'hide empty recommendation reason',
  );
  source = requiredReplace(
    source,
    'onClick={() => saveShareCard(shareTopic)}\n                  disabled={isSavingShareCard}\n                  className="h-[52px] rounded-full bg-emerald-700 text-[13px] font-black text-white hover:bg-emerald-800"',
    'onClick={() => window.dispatchEvent(new CustomEvent(\'aquaguide:feature-preview\', { detail: { feature: \'image-export\' } }))}\n                  className="h-[52px] rounded-full border border-slate-200 bg-slate-100 text-[13px] font-black text-slate-400 shadow-none hover:bg-slate-100"',
    'care share-card image export gate',
  );
  source = requiredReplace(
    source,
    "{isSavingShareCard ? (isEn ? 'Generating...' : '生成中...') : (isEn ? 'Save Image' : '保存图片')}",
    "{isEn ? 'Save image · Coming soon' : '保存图片 · 建设中'}",
    'care save image label',
  );
  write(path, source);
}

// 3) Settings sharing is visibly unfinished and no longer loads/manages live links.
{
  const path = 'src/pages/Settings.tsx';
  let source = read(path);
  source = source
    .replace("import { Check, ChevronRight, Download, Languages, Link2, MessageSquareText, RotateCcw, Settings2, ShieldCheck, Trash2 } from 'lucide-react';", "import { Check, ChevronRight, Languages, Link2, MessageSquareText, RotateCcw, Settings2, ShieldCheck } from 'lucide-react';")
    .replace(/import \{\n  listAquariumShareReports,[\s\S]*?\} from '\.\.\/services\/share\/aquarium-share-report\.service';\n/, '')
    .replace("import { AquaGuideApiError } from '../services/api/api-client';\n", '')
    .replace("import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';\n", '')
    .replace(/  const \[shareReports,[\s\S]*?  const \[pendingRevokeShareId, setPendingRevokeShareId\] = useState\(''\);\n/, '');
  source = requiredRegex(
    source,
    /\n  useEffect\(\(\) => \{\n    let active = true;\n    void listAquariumShareReports\(\)[\s\S]*?\n  \}, \[\]\);/,
    '',
    'remove settings share loading effect',
  );
  source = requiredRegex(
    source,
    /\n  const revokeShare = async \(id: string\) => \{[\s\S]*?\n  \};\n\n  const handleFeedbackSubmit/,
    '\n\n  const handleFeedbackSubmit',
    'remove settings share revoke action',
  );
  source = requiredRegex(
    source,
    /          <section id="shared-reports"[\s\S]*?          <\/section>\n\n          <section id="feedback"/,
    `          <section id="shared-reports" tabIndex={-1} className="scroll-mt-6 rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-slate-500 shadow-none sm:p-5" aria-labelledby="settings-share-title">\n            <div className="flex items-start gap-3">\n              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-slate-100 text-slate-400"><Link2 className="h-5 w-5" /></span>\n              <div className="min-w-0 flex-1">\n                <div className="inline-flex rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-black text-slate-500">{isEn ? 'COMING SOON' : '功能建设中'}</div>\n                <h2 id="settings-share-title" className="mt-2 text-base font-black text-slate-600">{isEn ? 'Sharing & privacy' : '分享与隐私'}</h2>\n                <p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{isEn ? 'Share links and privacy controls are being completed.' : '分享链接与隐私管理正在完善。'}</p>\n              </div>\n            </div>\n            <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'sharing' } }))} className="mt-4 min-h-11 rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400 shadow-none">{isEn ? 'View details' : '查看说明'}</button>\n          </section>\n\n          <section id="feedback"`,
    'replace settings share section',
  );
  source = requiredRegex(
    source,
    /\n      <Dialog open=\{Boolean\(pendingRevokeShareId\)\}[\s\S]*?\n      <\/Dialog>\n    <\/div>/,
    '\n    </div>',
    'remove settings share revoke dialog',
  );
  write(path, source);
}

// 4) Achievement card uses the same muted construction state.
{
  const path = 'src/pages/CollectionHub.tsx';
  let source = read(path);
  source = source
    .replace('tone="bg-amber-50 text-amber-700"', 'tone="bg-slate-100 text-slate-400"')
    .replace("title={isEn ? 'Achievements are being built' : '勋章系统建设中'}", "title={isEn ? 'Achievements are coming' : '成就勋章 · 建设中'}")
    .replace("description={isEn ? 'It will record long-term care milestones and habits.' : '将用于记录长期养护里程碑和习惯。'}", "description={isEn ? 'Track long-term care milestones.' : '记录你的养护里程碑。'}");
  write(path, source);
}

// 5) Species card image export is construction-only; text sharing remains available.
{
  const path = 'src/components/SpeciesDetailDialog.tsx';
  let source = read(path);
  source = requiredReplace(
    source,
    `onClick={() => {\n                      setExportError('');\n                      setIsExportOpen(true);\n                    }}\n                    className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-bg px-3 text-[11px] font-black text-ink/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"`,
    `onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'image-export' } }))}\n                    className="flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 text-[11px] font-black text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"`,
    'species export entry',
  );
  source = requiredReplace(
    source,
    "<span className=\"hidden min-[760px]:inline\">{isEn ? 'Export card' : '导出卡片'}</span>",
    "<span className=\"hidden min-[760px]:inline\">{isEn ? 'Export · Coming soon' : '导出 · 建设中'}</span>",
    'species export label',
  );
  source = requiredReplace(
    source,
    'disabled={isExportingCard} onClick={handleSaveExportCard} className="min-h-11 rounded-full bg-accent text-[12px] font-black text-white"',
    'onClick={() => window.dispatchEvent(new CustomEvent(\'aquaguide:feature-preview\', { detail: { feature: \'image-export\' } }))} className="min-h-11 rounded-full border border-slate-200 bg-slate-100 text-[12px] font-black text-slate-400 shadow-none"',
    'species save image button',
  );
  source = requiredReplace(
    source,
    "{isExportingCard ? (isEn ? 'Generating…' : '生成中…') : (isEn ? 'Save image' : '保存图片')}",
    "{isEn ? 'Save image · Coming soon' : '保存图片 · 建设中'}",
    'species save image label',
  );
  write(path, source);
}

// 6) Tank archive image exports and report sharing are muted construction actions.
{
  const path = 'src/components/aquarium/LivestockRosterDialog.tsx';
  let source = read(path);
  source = requiredReplace(
    source,
    'disabled={isCreatingShare} onClick={onCreateShare} aria-label={isEn ? \'Create share report\' : \'生成分享报告\'} title={isEn ? \'Create share report\' : \'生成分享报告\'} className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"',
    'onClick={() => window.dispatchEvent(new CustomEvent(\'aquaguide:feature-preview\', { detail: { feature: \'sharing\' } }))} aria-label={isEn ? \'Sharing is coming\' : \'分享功能建设中\'} title={isEn ? \'Sharing is coming\' : \'分享功能建设中\'} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"',
    'roster sharing gate',
  );
  source = requiredReplace(
    source,
    'onClick={onDownloadArchive} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-bg px-3 text-xs font-black text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"',
    'onClick={() => window.dispatchEvent(new CustomEvent(\'aquaguide:feature-preview\', { detail: { feature: \'image-export\' } }))} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 text-xs font-black text-slate-400 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"',
    'roster archive export gate',
  );
  source = source.replace("{isEn ? 'Export archive' : '导出档案'}", "{isEn ? 'Export · Coming soon' : '导出 · 建设中'}");
  source = requiredReplace(
    source,
    'onClick={onDownloadMilestone} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full bg-white px-3 text-xs font-black text-amber-800 shadow-sm"',
    'onClick={() => window.dispatchEvent(new CustomEvent(\'aquaguide:feature-preview\', { detail: { feature: \'image-export\' } }))} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 text-xs font-black text-slate-400 shadow-none"',
    'roster milestone export gate',
  );
  write(path, source);
}

// 7) Export center itself stays reachable by old links, but every unfinished action is visibly gray and non-live.
{
  const path = 'src/components/export/AquariumExportCenter.tsx';
  const source = `import { ArrowLeft, CheckSquare, ClipboardCheck, Download, FileArchive, HeartPulse, Link2, PartyPopper, Share2 } from 'lucide-react';\nimport type { ExportArtifactContent } from './ExportArtifactDialog';\n\nexport type ExportCenterItem = {\n  id: string;\n  title: string;\n  description: string;\n  content?: ExportArtifactContent;\n  unavailableReason?: string;\n  icon: 'health' | 'diagnosis' | 'plan' | 'checklist' | 'archive' | 'milestone';\n};\n\nconst icons = {\n  health: HeartPulse,\n  diagnosis: ClipboardCheck,\n  plan: CheckSquare,\n  checklist: CheckSquare,\n  archive: FileArchive,\n  milestone: PartyPopper,\n};\n\nconst showBuilding = (feature: 'image-export' | 'sharing') => {\n  window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature } }));\n};\n\nexport function AquariumExportCenter({ items, isEn, onBack }: {\n  items: ExportCenterItem[];\n  isEn: boolean;\n  onBack: () => void;\n  onPreview: (content: ExportArtifactContent) => void;\n  onCreateShare: () => void;\n  isCreatingShare: boolean;\n  shareUrl?: string;\n  onCopyShare: () => void;\n}) {\n  return (\n    <main className="mx-auto w-full max-w-[1080px] pb-24">\n      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-black text-emerald-800 hover:bg-emerald-50"><ArrowLeft className="h-4 w-4" />{isEn ? 'Back to aquarium' : '返回我的鱼缸'}</button>\n      <header className="mt-2 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-slate-500 shadow-none sm:p-7">\n        <span className="inline-flex rounded-full bg-slate-200/70 px-2.5 py-1 text-[10px] font-black text-slate-500">{isEn ? 'COMING SOON' : '功能建设中'}</span>\n        <h1 className="mt-3 text-2xl font-black text-slate-600 sm:text-3xl">{isEn ? 'Export & share' : '导出与分享'}</h1>\n        <p className="mt-2 text-sm font-semibold text-slate-400">{isEn ? 'Image export and share controls are being completed.' : '图片导出与分享功能正在完善。'}</p>\n      </header>\n      <section className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">\n        {items.map(item => {\n          const Icon = icons[item.icon];\n          return (\n            <article key={item.id} className="flex min-w-0 flex-col rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-slate-400 shadow-none">\n              <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-slate-100 text-slate-400"><Icon className="h-5 w-5" /></span>\n              <h2 className="mt-3 text-base font-black text-slate-600">{item.title}</h2>\n              <p className="mt-1 flex-1 text-xs font-semibold leading-5 text-slate-400">{item.description}</p>\n              <button type="button" onClick={() => showBuilding('image-export')} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 text-sm font-black text-slate-400 shadow-none"><Download className="h-4 w-4" />{isEn ? 'Image export · Coming soon' : '图片导出 · 建设中'}</button>\n            </article>\n          );\n        })}\n      </section>\n      <section className="mt-4 flex min-w-0 flex-col gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">\n        <div className="min-w-0"><div className="flex items-center gap-2 text-base font-black text-slate-600"><Share2 className="h-5 w-5" />{isEn ? 'Report sharing' : '报告分享'}</div><p className="mt-1 text-xs font-semibold leading-5 text-slate-400">{isEn ? 'Share links and privacy controls are being completed.' : '分享链接与隐私管理正在完善。'}</p></div>\n        <button type="button" onClick={() => showBuilding('sharing')} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-5 text-sm font-black text-slate-400 shadow-none"><Link2 className="h-4 w-4" />{isEn ? 'Sharing · Coming soon' : '分享 · 建设中'}</button>\n      </section>\n    </main>\n  );\n}\n`;
  write(path, source);
}

// 8) Export dialog can never perform a live image download while the feature is under construction.
{
  const path = 'src/components/export/ExportArtifactDialog.tsx';
  let source = read(path);
  source = source
    .replace("import { useState } from 'react';\n", '')
    .replace("import { Download, LoaderCircle } from 'lucide-react';", "import { Download } from 'lucide-react';")
    .replace("import { downloadArtifactContentAsPng, safeExportFileName } from '../../services/export/png-export.service';\n", '')
    .replace(/  const \[isDownloading,[\s\S]*?\n  if \(!content\) return null;/, '  if (!content) return null;')
    .replace(/\n  const download = async \(\) => \{[\s\S]*?\n  \};\n/, '\n');
  source = source.replace('<Dialog open={open} onOpenChange={(next) => !isDownloading && onOpenChange(next)}>', '<Dialog open={open} onOpenChange={onOpenChange}>');
  source = source.replace("<DialogTitle className=\"text-lg font-black\">{isEn ? 'Download image' : '下载图片'}</DialogTitle>", "<DialogTitle className=\"text-lg font-black text-slate-600\">{isEn ? 'Image export · Coming soon' : '图片导出 · 建设中'}</DialogTitle>");
  source = source.replace("<DialogDescription>{isEn ? 'Preview the privacy-safe card before saving.' : '保存前可预览本次生成的记录卡。'}</DialogDescription>", "<DialogDescription>{isEn ? 'Image saving is being completed.' : '图片保存功能正在完善。'}</DialogDescription>");
  source = source.replace(/\n          \{error && <p[\s\S]*?<\/p>\}/, '');
  source = requiredRegex(
    source,
    /          <Button type="button" onClick=\{\(\) => void download\(\)\}[\s\S]*?          <\/Button>/,
    `          <Button type="button" onClick={() => window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'image-export' } }))} className="min-h-11 w-full rounded-full border border-slate-200 bg-slate-100 font-black text-slate-400 shadow-none hover:bg-slate-100">\n            <Download className="mr-2 h-4 w-4" />\n            {isEn ? 'Image export · Coming soon' : '图片导出 · 建设中'}\n          </Button>`,
    'export dialog download button',
  );
  write(path, source);
}
