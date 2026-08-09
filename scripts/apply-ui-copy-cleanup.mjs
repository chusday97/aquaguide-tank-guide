import { readFileSync, writeFileSync, rmSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const write = (path, value) => writeFileSync(path, value, 'utf8');
const replace = (source, from, to, label) => {
  if (!source.includes(from)) throw new Error(`Missing pattern: ${label}`);
  return source.replace(from, to);
};
const replaceRegex = (source, pattern, to, label) => {
  if (!pattern.test(source)) throw new Error(`Missing pattern: ${label}`);
  pattern.lastIndex = 0;
  return source.replace(pattern, to);
};

// 1) Production routes: hide internal experiments and close unfinished achievements.
{
  const path = 'src/App.tsx';
  let source = read(path);
  source = source
    .replace("const loadProjectStructure = () => import('./pages/ProjectStructurePreview');\n", '')
    .replace("const loadThreeDemo = () => import('./pages/ThreeDemo').then(module => ({ default: module.ThreeDemo }));\n", '')
    .replace("const ProjectStructurePreview = lazyWithRecovery(loadProjectStructure, 'project-structure');\n", '')
    .replace("const ThreeDemo = lazyWithRecovery(loadThreeDemo, '3d-demo');\n", '')
    .replace("  const isStructurePreview = location.pathname === '/project-structure';\n", '')
    .replace("  if (!preferencesReady && !isStructurePreview && !isLogin && !isAdminContent && !isSharedReport) return <PageLoading />;", "  if (!preferencesReady && !isLogin && !isAdminContent && !isSharedReport) return <PageLoading />;")
    .replace("    achievements: '/collection/achievements',\n", '')
    .replace("          <Route path=\"/collection/achievements\" element={page(<Collection module=\"achievements\" />, 'collection-achievements')} />", "          <Route path=\"/collection/achievements\" element={<Navigate to=\"/collection\" replace />} />")
    .replace("          <Route path=\"/3d-demo\" element={page(<ThreeDemo />, '3d-demo')} />\n", '');
  source = replaceRegex(
    source,
    /\n  if \(isStructurePreview\) \{[\s\S]*?\n  \}\n\n  if \(isLogin\)/,
    '\n\n  if (isLogin)',
    'remove project structure route shell',
  );
  write(path, source);
}

// 2) Feature preview: auth + achievements only. AI is a live feature now.
{
  const path = 'src/components/layout/WorkspaceNavigationProvider.tsx';
  let source = read(path);
  source = source
    .replace("import { loadAppStateFromStorage } from '../../services/storage/local-app-state';\n", '')
    .replace("import { getAquariumAiReadiness, type AquariumAiSetupPanel } from '../../services/aquarium/aquarium-setup.service';\n", '')
    .replace('// AQUAGUIDE_PRODUCT_UX_CLOSURE_V1\n', '')
    .replace('// AQUAGUIDE_AI_OPEN_V1\n', '');

  source = replaceRegex(
    source,
    /type FeaturePreviewState = \{[\s\S]*?\n\};\n\nconst isEnglishUi/,
    `type FeaturePreviewState = {\n  kind: 'auth' | 'achievements';\n  title: string;\n  description: string;\n};\n\nconst isEnglishUi`,
    'feature preview state',
  );

  source = replaceRegex(
    source,
    /const buildFeaturePreview = \(kind: 'auth' \| 'ai'\): FeaturePreviewState => \{[\s\S]*?\n\};\n\nconst getWorkspaceScroller/,
    `const buildFeaturePreview = (kind: 'auth' | 'achievements'): FeaturePreviewState => {\n  const isEn = isEnglishUi();\n  if (kind === 'auth') {\n    return {\n      kind,\n      title: isEn ? 'Cloud sync is coming' : '云端同步 · 建设中',\n      description: isEn\n        ? 'Sign in will sync tanks and care data across devices. This feature is still being completed.'\n        : '登录后可跨设备同步鱼缸和养护数据。该功能正在完善。',\n    };\n  }\n  return {\n    kind,\n    title: isEn ? 'Achievements are coming' : '成就勋章 · 建设中',\n    description: isEn\n      ? 'Badges will record long-term care milestones and habits. They will open after the system is complete.'\n      : '用于记录长期养护里程碑和习惯。系统完善后开放。',\n  };\n};\n\nconst getWorkspaceScroller`,
    'feature preview builder',
  );

  source = source.replace(
    "  const showFeaturePreview = useCallback((kind: 'auth' | 'ai') => {",
    "  const showFeaturePreview = useCallback((kind: 'auth' | 'achievements') => {",
  );

  source = replaceRegex(
    source,
    /  useEffect\(\(\) => \{\n    const handleFeaturePreviewEvent[\s\S]*?\n  \}, \[showFeaturePreview\]\);/,
    `  useEffect(() => {\n    const handleFeaturePreviewEvent = (event: Event) => {\n      const feature = (event as CustomEvent<{ feature?: string }>).detail?.feature || '';\n      if (/^auth/i.test(feature)) showFeaturePreview('auth');\n      if (/achievement|badge|medal|成就|勋章/i.test(feature)) showFeaturePreview('achievements');\n    };\n    const handleFeatureClick = (event: MouseEvent) => {\n      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('button, a, [role="button"]') : null;\n      if (!target) return;\n      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || '' : '';\n      const text = (target.textContent || '').replace(/\\s+/g, ' ').trim();\n      if (/^\\/login(?:[/?#]|$)/.test(href)) {\n        event.preventDefault();\n        event.stopPropagation();\n        showFeaturePreview('auth');\n        return;\n      }\n      if (/^\\/collection\\/achievements(?:[/?#]|$)/.test(href) || /成就勋章|Achievements|Badges/i.test(text)) {\n        event.preventDefault();\n        event.stopPropagation();\n        showFeaturePreview('achievements');\n      }\n    };\n    window.addEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);\n    document.addEventListener('click', handleFeatureClick, true);\n    return () => {\n      window.removeEventListener('aquaguide:feature-preview', handleFeaturePreviewEvent as EventListener);\n      document.removeEventListener('click', handleFeatureClick, true);\n    };\n  }, [showFeaturePreview]);`,
    'feature preview click handling',
  );

  source = source.replace(
`    if (/^\\/login(?:[/?#]|$)/.test(path)) {\n      showFeaturePreview('auth');\n      return;\n    }`,
`    if (/^\\/login(?:[/?#]|$)/.test(path)) {\n      showFeaturePreview('auth');\n      return;\n    }\n    if (/^\\/collection\\/achievements(?:[/?#]|$)/.test(path)) {\n      showFeaturePreview('achievements');\n      return;\n    }`,
  );
  source = source.replace(
`    if (/^\\/login(?:[/?#]|$)/.test(targetPath)) {\n      showFeaturePreview('auth');\n      return;\n    }`,
`    if (/^\\/login(?:[/?#]|$)/.test(targetPath)) {\n      showFeaturePreview('auth');\n      return;\n    }\n    if (/^\\/collection\\/achievements(?:[/?#]|$)/.test(targetPath)) {\n      showFeaturePreview('achievements');\n      return;\n    }`,
  );

  source = replaceRegex(
    source,
    /\n            \{featurePreview\.kind === 'ai'[\s\S]*?\n            <div className="mt-5 grid gap-2 sm:grid-cols-2">[\s\S]*?\n              <button type="button" onClick=\{\(\) => setFeaturePreview\(null\)\}/,
    `\n            <div className="mt-5">\n              <button type="button" onClick={() => setFeaturePreview(null)}`,
    'remove AI-only preview details',
  );
  source = source.replace(' className="min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-ink/65 hover:bg-slate-50">', ' className="min-h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-ink/65 hover:bg-slate-50">');
  source = source.replace('            </div>\n          </section>', '            </div>\n          </section>');
  write(path, source);
}

// 3) Collection hub: achievements stay visible but are explicitly in construction.
{
  const path = 'src/pages/CollectionHub.tsx';
  let source = read(path);
  source = source.replace(
    '  const navigate = useNavigate();\n  return (',
    `  const navigate = useNavigate();\n  const openModule = () => {\n    if (id === 'achievements') {\n      window.dispatchEvent(new CustomEvent('aquaguide:feature-preview', { detail: { feature: 'achievements' } }));\n      return;\n    }\n    navigate(moduleRoutes[id]);\n  };\n  return (`,
  );
  source = source.replaceAll('onClick={() => navigate(moduleRoutes[id])}', 'onClick={openModule}');
  source = replaceRegex(
    source,
    /\n        <CollectionModuleCard\n          id="achievements"[\s\S]*?\n        <\/CollectionModuleCard>/,
    `\n        <CollectionModuleCard\n          id="achievements"\n          title={isEn ? 'Achievements' : '成就勋章'}\n          count={isEn ? 'Coming soon' : '建设中'}\n          icon={<Medal className="h-5 w-5" />}\n          tone="bg-amber-50 text-amber-700"\n          remainingCount={0}\n          moreLabel=""\n        >\n          <PreviewEmpty\n            icon={<Medal className="h-5 w-5" />}\n            title={isEn ? 'Achievements are being built' : '勋章系统建设中'}\n            description={isEn ? 'It will record long-term care milestones and habits.' : '将用于记录长期养护里程碑和习惯。'}\n          />\n        </CollectionModuleCard>`,
    'achievements card',
  );
  write(path, source);
}

// 4) Care references: visible, compact, and linked to the original source.
{
  const path = 'src/pages/CareEncyclopedia.tsx';
  let source = read(path);
  source = source
    .replace('AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Download, Droplets, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves', 'AlertTriangle, Baby, Check, ChevronDown, ChevronRight, Copy, Download, Droplets, ExternalLink, Fish, Heart, HelpCircle, Loader2, Maximize2, Search, Settings, Stethoscope, Waves')
    .replace('  getCareReferenceReviewStatus,\n', '')
    .replace('  const careReferenceStatus = getCareReferenceReviewStatus(topic);\n', '');

  source = replaceRegex(
    source,
    /function ActionEvidenceInline\(\{ evidence, isEn \}: \{ evidence\?: CareActionEvidence; isEn: boolean \}\) \{[\s\S]*?\n\}\n\nexport function CareArticleDetail/,
    `function ActionEvidenceInline({ evidence, isEn }: { evidence?: CareActionEvidence; isEn: boolean }) {\n  if (!evidence || evidence.citations.length === 0) return null;\n  return (\n    <div className="mt-1.5 flex items-center gap-1.5" data-care-action-evidence={evidence.id}>\n      <span className="text-[9px] font-bold text-ink/38">{isEn ? 'Sources' : '来源'}</span>\n      {evidence.citations.slice(0, 2).map(reference => (\n        <a\n          key={reference.id}\n          href={reference.url}\n          target="_blank"\n          rel="noreferrer"\n          title={\`${'${reference.publisher} · ${reference.title}'}\`}\n          aria-label={isEn ? \`Open source: ${'${reference.publisher}'}\` : \`打开来源：${'${reference.publisher}'}\`}\n          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"\n          data-action-kind="external"\n        >\n          <ExternalLink className="h-3.5 w-3.5" />\n        </a>\n      ))}\n    </div>\n  );\n}\n\nexport function CareArticleDetail`,
    'inline evidence links',
  );

  source = replaceRegex(
    source,
    /          <section className="mt-3 rounded-\[18px\] border border-border bg-white p-3" data-care-references>[\s\S]*?          <\/section>\n\n          \{relatedTopics\.length > 0 && \(/,
    `          <section className="mt-3 rounded-[18px] border border-border bg-white p-3" data-care-references>\n            <div className="text-[13px] font-black text-ink">{isEn ? 'Sources' : '参考来源'}</div>\n            <div className="mt-2 flex flex-wrap gap-2">\n              {careReferences.map(reference => (\n                <a\n                  key={reference.id}\n                  href={reference.url}\n                  target="_blank"\n                  rel="noreferrer"\n                  title={\`${'${reference.publisher} · ${reference.title}'}\`}\n                  aria-label={isEn ? \`Open ${'${reference.publisher}'} source\` : \`打开 ${'${reference.publisher}'} 原文\`}\n                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/55 px-3 text-[11px] font-black text-emerald-800 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"\n                  data-action-kind="external"\n                >\n                  <ExternalLink className="h-3.5 w-3.5" />\n                  <span>{reference.publisher}</span>\n                </a>\n              ))}\n            </div>\n          </section>\n\n          {relatedTopics.length > 0 && (`,
    'reference section',
  );
  write(path, source);
}

// 5) Remove internal implementation language from the live compatibility UI.
{
  const path = 'src/components/CompatibilityRiskCalculator.tsx';
  let source = read(path);
  const pairs = [
    ['当前鱼缸已有生物作为基线，你只需要选择“准备加入”的生物。系统会指出具体冲突对象、原因和调整动作。', '选择准备加入的生物，查看是否适合当前鱼缸。'],
    ['判断基线', '当前鱼缸'],
    ["{relevantPairs.length} {isEn ? 'relationships checked' : '组关系已检查'}", "{isEn ? 'Compatibility' : '混养结果'}"],
    ['系统不会替你猜“哪只更重要”，而是把可执行的安全选择直接列出来。', '选择一个调整方案后会立即重新计算。'],
    ['AI 解释并给调整建议', 'AI 建议'],
    ['AI 只读取已确认的鱼缸参数。还缺：', '还缺：'],
    ['AI 解读', 'AI 建议'],
    ['最终安全结论仍由规则确定；AI 负责解释依据、整理调整方案，不会把阻断结论改成“可以养”。', '基于当前鱼缸和风险结果给出调整建议。'],
    ['✓ DeepSeek 模型回复', 'AI 已生成'],
    ['本地兜底 · AI 本次没有参与', 'AI 暂不可用'],
  ];
  for (const [from, to] of pairs) source = source.replaceAll(from, to);
  write(path, source);
}

// 6) Make fallback copy user-facing instead of exposing implementation terms.
{
  const path = 'src/lib/aiClient.ts';
  let source = read(path);
  const pairs = [
    ['AI 暂不可用，系统规则仍可使用。', 'AI 建议暂时不可用。'],
    ['当前只展示本地规则结果，AI 没有参与判断或改写结论。', '请先参考当前风险结果。'],
    ['本地模板', '当前结果'],
    ['查看系统规则', '查看风险结果'],
    ['先处理页面中的阻断、风险或缺失信息，再重新评估。', '先处理当前风险或缺失信息，再重新评估。'],
    ['查看系统规则依据', '查看风险原因'],
    ['处理风险或缺失信息', '处理风险或补充信息'],
    ['最终判断以系统规则结果为准', '请结合当前鱼缸状态判断。'],
    ['当前结果以系统规则为准，AI 失败不会影响本地适配判断。', 'AI 建议暂时不可用，请先参考当前结果。'],
    ['AI 解读暂不可用，当前结果以系统规则为准。', 'AI 建议暂时不可用。'],
    ['AI 辅助暂不可用，当前推荐已按本地规则排序。', 'AI 建议暂时不可用。'],
    ['来自本地规则', '当前结果'],
    ['先参考系统规则结果逐项调整。', '请根据当前结果逐项调整。'],
    ['本地规则候选。', '当前候选。'],
  ];
  for (const [from, to] of pairs) source = source.replaceAll(from, to);
  write(path, source);
}

// 7) Stop mutating source during Vercel builds.
{
  const path = 'vercel.json';
  const config = JSON.parse(read(path));
  delete config.buildCommand;
  write(path, `${JSON.stringify(config, null, 2)}\n`);
}

rmSync('public/ai-care-plan.html', { force: true });
rmSync('scripts/open-ai-feature-gate.mjs', { force: true });
